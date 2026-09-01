# Automatic Object Segmentation

Purpose: reduce teacher setup work by extracting many reusable object contours from each room image in advance.

## One-time setup

```bash
python3 -m pip install -r requirements-auto-segmentation.txt
```

## Generate contours for every room image

```bash
python3 tools/auto_segment.py
```

The first run downloads the small segmentation model once. Later runs reuse the local model cache.

Generated files are written to:

```text
public/world-assets/object-maps/
  entrance.json
  study-entry.json
  study-exit.json
  kitchen-entry.json
  kitchen-exit.json
  ...
```

Each detected object contains:

- object id
- label
- confidence
- bounding box
- polygon contour in 0-100 scene coordinates

The contour is reusable at different screen sizes and can be used for both clicking and guide-mode glow effects.

## Intended teacher workflow

1. Add a room image.
2. Run automatic segmentation once.
3. The app receives many object-shape candidates in advance.
4. The teacher chooses which object should hold a lesson/slide.
5. Only incorrect or missing contours need manual correction.

The long-term UI should therefore be **select an existing object**, not **draw every hotspot by hand**.

## Privacy / classroom operation

Segmentation is designed as a local preprocessing step. Room images do not need to be uploaded to an external service. Once object maps are generated, classroom presentation only uses the saved image and JSON contour data.
