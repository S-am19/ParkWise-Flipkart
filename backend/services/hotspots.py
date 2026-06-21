import pandas as pd


def _dominant(series: pd.Series) -> str:
    modes = series.dropna().astype(str).value_counts()
    return str(modes.index[0]) if not modes.empty else "UNKNOWN"


def _hourly_distribution(group: pd.DataFrame) -> dict[int, int]:
    counts = group["hour"].value_counts().to_dict()
    return {hour: int(counts.get(hour, 0)) for hour in range(24)}


def compute_hotspots(df: pd.DataFrame, min_count: int = 5) -> pd.DataFrame:
    grouped = df.groupby("hotspot_id", sort=False)
    rows = []
    for hotspot_id, group in grouped:
        violation_count = int(len(group))
        if violation_count < min_count:
            continue

        hourly = _hourly_distribution(group)
        peak_hour = max(hourly, key=hourly.get)
        named_junctions = group.loc[group["has_named_junction"], "junction_name"]
        display_location = (
            _dominant(named_junctions)
            if not named_junctions.empty
            else _dominant(group["location"])
        )

        rows.append(
            {
                "hotspot_id": hotspot_id,
                "location": display_location,
                "violation_count": violation_count,
                "raw_count": violation_count,
                "dominant_violation_type": _dominant(group["primary_violation_type"]),
                "hourly_distribution": hourly,
                "peak_hour": int(peak_hour),
                "junction_ratio": float(group["has_named_junction"].mean()),
                "latitude_center": float(group["latitude"].mean()),
                "longitude_center": float(group["longitude"].mean()),
            }
        )

    hotspots = pd.DataFrame(rows)
    if hotspots.empty:
        return hotspots
    return hotspots.sort_values("violation_count", ascending=False).reset_index(drop=True)
