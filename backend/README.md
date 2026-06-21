# ParkWise Backend

Backend-only FastAPI analytics engine for **ParkWise: AI-Powered Parking Intelligence System**.

This phase intentionally contains no frontend, React, Next.js, Tailwind, Docker, database, message queue, or microservice code.

## What It Computes

- Hotspot detection using latitude/longitude grid buckets rounded to 3 decimals.
- Detection Reliability Score from approved/rejected validation outcomes per device.
- Reliability-adjusted hotspot density and confidence levels.
- Rare-violation severity scoring.
- Traffic Impact Index using dynamic variance-based weights.
- Emerging hotspot detection from recent 7-day activity versus historical activity.
- Enforcement capacity planning.
- Enforcement impact simulation.

All analytics are deterministic and derived entirely from the local CSV dataset. No AI model is used for calculations.

## Folder Structure

```text
backend/
├── main.py
├── requirements.txt
├── README.md
├── services/
│   ├── preprocessing.py
│   ├── hotspots.py
│   ├── reliability.py
│   ├── severity.py
│   ├── tii.py
│   ├── emerging.py
│   ├── planner.py
│   └── simulator.py
├── models/
│   └── schemas.py
├── cache/
└── dataset/
```

## Dataset

The loader automatically searches for a CSV in:

1. `backend/dataset/`
2. `backend/`
3. the project root

The included project dataset named similar to `jan to may police violation_anonymized791b166 (1).csv` is detected automatically.

Expected columns include:

```text
latitude, longitude, location, vehicle_type, violation_type,
created_datetime, police_station, junction_name, validation_status, device_id
```

Missing expected columns are created with safe defaults. `violation_type` values like `["WRONG PARKING","NO PARKING"]` are parsed into Python lists.

## Setup

From the `backend` directory:

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

Open the generated OpenAPI docs:

```text
http://127.0.0.1:8000/docs
```

## Startup Pipeline

At server startup, the app:

1. Finds and loads the CSV.
2. Cleans missing values and converts timestamps.
3. Parses violation lists.
4. Computes hotspot metrics.
5. Computes device reliability and hotspot confidence.
6. Computes severity and TII.
7. Computes emerging hotspots.
8. Stores results in memory.
9. Saves processed and analytics cache files under `backend/cache/`.

API requests read from memory, so heavy calculations do not run per request.

## Endpoints

### `GET /health`

Returns backend readiness and dataset metadata.

### `GET /api/summary`

Example:

```json
{
  "total_violations": 300000,
  "hotspots_count": 1234,
  "emerging_count": 42,
  "avg_city_tii": 37.25
}
```

### `GET /api/hotspots`

Optional query:

```text
limit=100
```

Example record:

```json
{
  "hotspot_id": "12.926_77.619",
  "location": "18th Main Road, Block 2, Koramangala",
  "latitude": 12.925557,
  "longitude": 77.618665,
  "confidence_level": "High Confidence",
  "violation_count": 250,
  "peak_hour": 9,
  "D": 0.98,
  "S": 0.31,
  "J": 0.15,
  "P": 0.22,
  "TII": 68.4
}
```

### `GET /api/emerging`

Defaults to flagged emerging hotspots only.

Optional query:

```text
only_flagged=false
```

### `GET /api/planner?wardens=10`

Returns exactly 10 deployment recommendations.

### `GET /api/simulator?wardens=10`

Example:

```json
{
  "current_city_tii": 37.25,
  "future_city_tii": 34.18,
  "improvement_pct": 8.24
}
```

### `GET /api/debug/weights`

Returns the dynamic capped variance-based TII weights currently used by the analytics engine.
Raw weights are first derived from feature variance, each component is capped at `0.40`,
and remaining weight is redistributed proportionally so the final weights sum to `1.0`
without any single component dominating the TII.

Example:

```json
{
  "density_weight": 0.313528,
  "severity_weight": 0.112327,
  "junction_weight": 0.4,
  "peak_weight": 0.174145
}
```

### `GET /api/debug/confidence-distribution`

Returns counts of hotspot confidence labels.

Example:

```json
{
  "High Confidence": 4069,
  "Medium Confidence": 0,
  "Low Confidence": 0
}
```

### `GET /api/debug/emerging-stats`

Returns emerging hotspot statistics computed from escalation percentages.

Example:

```json
{
  "total_hotspots": 4069,
  "emerging_hotspots": 768,
  "emerging_percentage": 18.87,
  "threshold": 50,
  "median_escalation": -100,
  "p90_escalation": 100,
  "max_escalation": 100
}
```

### `GET /api/dashboard`

Returns the combined payload used by the future Next.js dashboard.

Example shape:

```json
{
  "summary": {},
  "weights": {},
  "confidence_distribution": {},
  "hotspots": [],
  "emerging": []
}
```

## Notes

- Hotspot noise is removed when `violation_count < 5`.
- Device reliability only evaluates devices with at least 100 approved/rejected records.
- Validation statuses outside `approved` and `rejected` are ignored for DRS.
- TII weights are calculated from feature variance at startup, capped at `0.40` per component, and renormalized to sum to `1.0`.
- Planner recommendations are unique by physical location label to avoid repeated deployment targets from adjacent grid cells.
- Cache keys include dataset path, size, and modified time, so changing the CSV automatically invalidates cached outputs.
