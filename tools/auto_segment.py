#!/usr/bin/env python3
"""Automatically extract reusable object contours from world images.

Normal mode runs one segmentation pass over each scene image.
Fine mode additionally analyzes overlapping image tiles so small objects occupy
more pixels during inference. This often separates items that were previously
collapsed into one larger shelf/table object.

The output uses scene-percent coordinates (0-100), so the browser can reuse the
same contours at any display size.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Iterable

import cv2
from ultralytics import YOLO

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def clamp_percent(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 3)


def normalize_polygon(points, width: int, height: int, max_points: int = 100):
    if points is None or len(points) < 3:
        return []

    stride = max(1, math.ceil(len(points) / max_points))
    sampled = points[::stride]
    if len(sampled) < 3:
        sampled = points

    return [
        [clamp_percent(float(x) / width * 100.0), clamp_percent(float(y) / height * 100.0)]
        for x, y in sampled
    ]


def bbox_from_polygon(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    return {
        "x": round(min_x, 3),
        "y": round(min_y, 3),
        "width": round(max_x - min_x, 3),
        "height": round(max_y - min_y, 3),
    }


def bbox_iou(a, b) -> float:
    ax2 = a["x"] + a["width"]
    ay2 = a["y"] + a["height"]
    bx2 = b["x"] + b["width"]
    by2 = b["y"] + b["height"]

    ix1 = max(a["x"], b["x"])
    iy1 = max(a["y"], b["y"])
    ix2 = min(ax2, bx2)
    iy2 = min(ay2, by2)
    iw = max(0.0, ix2 - ix1)
    ih = max(0.0, iy2 - iy1)
    intersection = iw * ih
    if intersection <= 0:
        return 0.0

    union = a["width"] * a["height"] + b["width"] * b["height"] - intersection
    return intersection / union if union > 0 else 0.0


def iter_images(input_dir: Path) -> Iterable[Path]:
    for path in sorted(input_dir.iterdir()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            yield path


def extract_objects_from_result(result, full_width: int, full_height: int, offset_x: int = 0, offset_y: int = 0, source: str = "full"):
    objects = []
    if result.masks is None or result.boxes is None:
        return objects

    names = result.names
    masks_xy = result.masks.xy

    for mask_points, box in zip(masks_xy, result.boxes):
        if mask_points is None or len(mask_points) < 3:
            continue

        translated = [(float(x) + offset_x, float(y) + offset_y) for x, y in mask_points]
        points = normalize_polygon(translated, full_width, full_height)
        if len(points) < 3:
            continue

        class_id = int(box.cls.item())
        label = str(names.get(class_id, class_id))
        score = float(box.conf.item())
        objects.append(
            {
                "label": label,
                "confidence": round(score, 4),
                "bbox": bbox_from_polygon(points),
                "points": points,
                "source": source,
            }
        )

    return objects


def tile_origins(length: int, tile_size: int, overlap: float):
    if length <= tile_size:
        return [0]
    step = max(1, int(tile_size * (1.0 - overlap)))
    origins = list(range(0, max(1, length - tile_size + 1), step))
    last = max(0, length - tile_size)
    if not origins or origins[-1] != last:
        origins.append(last)
    return origins


def deduplicate(objects, iou_threshold: float = 0.72):
    """Drop near-identical detections while preserving distinct small neighbors."""
    kept = []
    for candidate in sorted(objects, key=lambda item: item["confidence"], reverse=True):
        duplicate = False
        for existing in kept:
            # Only aggressively deduplicate detections with the same predicted class.
            if candidate["label"] != existing["label"]:
                continue
            if bbox_iou(candidate["bbox"], existing["bbox"]) >= iou_threshold:
                duplicate = True
                break
        if not duplicate:
            kept.append(candidate)
    return kept


def assign_ids(objects):
    counters = {}
    for item in objects:
        safe_label = item["label"].lower().replace(" ", "-").replace("/", "-")
        counters[safe_label] = counters.get(safe_label, 0) + 1
        item["id"] = f"{safe_label}-{counters[safe_label]:03d}"
    return objects


def segment_image(model: YOLO, image_path: Path, confidence: float, imgsz: int, fine: bool, tile_size: int, tile_overlap: float):
    image = cv2.imread(str(image_path))
    if image is None:
        raise RuntimeError(f"Could not read image: {image_path}")

    full_height, full_width = image.shape[:2]
    objects = []

    full_result = model(image, verbose=False, conf=confidence, imgsz=imgsz)[0]
    objects.extend(extract_objects_from_result(full_result, full_width, full_height, source="full"))

    if fine:
        xs = tile_origins(full_width, tile_size, tile_overlap)
        ys = tile_origins(full_height, tile_size, tile_overlap)
        for y in ys:
            for x in xs:
                tile = image[y:min(y + tile_size, full_height), x:min(x + tile_size, full_width)]
                if tile.shape[0] < 96 or tile.shape[1] < 96:
                    continue
                result = model(tile, verbose=False, conf=confidence, imgsz=imgsz)[0]
                objects.extend(
                    extract_objects_from_result(
                        result,
                        full_width,
                        full_height,
                        offset_x=x,
                        offset_y=y,
                        source=f"tile:{x},{y}",
                    )
                )

    objects = deduplicate(objects)
    objects.sort(
        key=lambda item: (
            item["bbox"]["width"] * item["bbox"]["height"],
            -item["confidence"],
            item["label"],
        )
    )
    return full_width, full_height, assign_ids(objects)


def main() -> None:
    parser = argparse.ArgumentParser(description="Auto-segment Spatial Presenter room images")
    parser.add_argument("--input", default="public/world-assets", help="Directory containing room images")
    parser.add_argument("--output", default="public/world-assets/object-maps", help="Directory for generated JSON object maps")
    parser.add_argument("--model", default="yolo11n-seg.pt", help="Ultralytics segmentation model")
    parser.add_argument("--confidence", type=float, default=None, help="Detection confidence. Fine mode defaults to 0.12; normal mode to 0.22")
    parser.add_argument("--imgsz", type=int, default=None, help="Inference image size. Fine mode defaults to 960; normal mode to 640")
    parser.add_argument("--fine", action="store_true", help="Also scan overlapping tiles to find smaller objects")
    parser.add_argument("--tile-size", type=int, default=640, help="Tile size in pixels for --fine")
    parser.add_argument("--tile-overlap", type=float, default=0.25, help="Tile overlap ratio for --fine")
    args = parser.parse_args()

    confidence = args.confidence if args.confidence is not None else (0.12 if args.fine else 0.22)
    imgsz = args.imgsz if args.imgsz is not None else (960 if args.fine else 640)

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    if not input_dir.exists():
        raise SystemExit(f"Input directory not found: {input_dir}")

    print(f"Loading segmentation model: {args.model}")
    print(f"Mode: {'FINE (small-object tiled scan)' if args.fine else 'NORMAL'} | conf={confidence} | imgsz={imgsz}")
    model = YOLO(args.model)

    images = list(iter_images(input_dir))
    if not images:
        raise SystemExit(f"No images found in {input_dir}")

    total_objects = 0
    for image_path in images:
        width, height, objects = segment_image(
            model,
            image_path,
            confidence,
            imgsz,
            args.fine,
            args.tile_size,
            args.tile_overlap,
        )
        total_objects += len(objects)
        payload = {
            "version": 2,
            "sceneId": image_path.stem,
            "source": f"/world-assets/{image_path.name}",
            "imageWidth": width,
            "imageHeight": height,
            "mode": "fine" if args.fine else "normal",
            "objects": objects,
        }

        output_path = output_dir / f"{image_path.stem}.json"
        output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{image_path.name}: {len(objects)} objects -> {output_path}")

    print(f"Done. {len(images)} images, {total_objects} object contours.")
    if args.fine:
        print("Fine mode keeps smaller candidates first so teachers can choose individual items when available.")
    print("Detected labels are only suggestions; the editor should allow teachers to rename/register objects freely.")


if __name__ == "__main__":
    main()
