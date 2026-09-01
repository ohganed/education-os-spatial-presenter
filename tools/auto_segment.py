#!/usr/bin/env python3
"""Automatically extract object contours from world images.

The output is a lightweight JSON object map per scene. Coordinates are stored as
percentages (0-100), so the browser can reuse them at any display size.

Default backend: Ultralytics YOLO segmentation (small model).
The model is downloaded once by Ultralytics on first use and then cached locally.
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Iterable

from ultralytics import YOLO

IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def clamp_percent(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 3)


def normalize_polygon(points, width: int, height: int, max_points: int = 80):
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


def iter_images(input_dir: Path) -> Iterable[Path]:
    for path in sorted(input_dir.iterdir()):
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            yield path


def segment_image(model: YOLO, image_path: Path, confidence: float):
    results = model(str(image_path), verbose=False, conf=confidence)
    result = results[0]
    height, width = result.orig_shape

    objects = []
    if result.masks is None or result.boxes is None:
        return width, height, objects

    names = result.names
    masks_xy = result.masks.xy

    for index, (mask_points, box) in enumerate(zip(masks_xy, result.boxes)):
        points = normalize_polygon(mask_points, width, height)
        if len(points) < 3:
            continue

        class_id = int(box.cls.item())
        label = str(names.get(class_id, class_id))
        score = float(box.conf.item())
        safe_label = label.lower().replace(" ", "-")

        objects.append(
            {
                "id": f"{safe_label}-{index + 1:03d}",
                "label": label,
                "confidence": round(score, 4),
                "bbox": bbox_from_polygon(points),
                "points": points,
            }
        )

    objects.sort(key=lambda item: (-item["confidence"], item["label"], item["id"]))
    return width, height, objects


def main() -> None:
    parser = argparse.ArgumentParser(description="Auto-segment Spatial Presenter room images")
    parser.add_argument(
        "--input",
        default="public/world-assets",
        help="Directory containing room images (default: public/world-assets)",
    )
    parser.add_argument(
        "--output",
        default="public/world-assets/object-maps",
        help="Directory for generated JSON object maps",
    )
    parser.add_argument(
        "--model",
        default="yolo11n-seg.pt",
        help="Ultralytics segmentation model. yolo11n-seg.pt is small and fast.",
    )
    parser.add_argument("--confidence", type=float, default=0.22)
    args = parser.parse_args()

    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    if not input_dir.exists():
        raise SystemExit(f"Input directory not found: {input_dir}")

    print(f"Loading segmentation model: {args.model}")
    model = YOLO(args.model)

    images = list(iter_images(input_dir))
    if not images:
        raise SystemExit(f"No images found in {input_dir}")

    total_objects = 0
    for image_path in images:
        width, height, objects = segment_image(model, image_path, args.confidence)
        total_objects += len(objects)
        payload = {
            "version": 1,
            "sceneId": image_path.stem,
            "source": f"/world-assets/{image_path.name}",
            "imageWidth": width,
            "imageHeight": height,
            "objects": objects,
        }

        output_path = output_dir / f"{image_path.stem}.json"
        output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"{image_path.name}: {len(objects)} objects -> {output_path}")

    print(f"Done. {len(images)} images, {total_objects} object contours.")
    print("The generated maps are reusable; teachers do not need to redraw the contours each time.")


if __name__ == "__main__":
    main()
