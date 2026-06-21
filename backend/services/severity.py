from collections import Counter

import pandas as pd


def compute_violation_severity(df: pd.DataFrame) -> dict[str, float]:
    counter: Counter[str] = Counter()
    for types in df["violation_types"]:
        counter.update(types)

    if not counter:
        return {"UNKNOWN": 0.0}

    max_freq = max(counter.values())
    return {violation: 1 - (freq / max_freq) for violation, freq in counter.items()}


def attach_hotspot_severity(
    df: pd.DataFrame,
    hotspots: pd.DataFrame,
    severity_map: dict[str, float],
) -> pd.DataFrame:
    if hotspots.empty:
        return hotspots

    expanded = df[["hotspot_id", "violation_types"]].explode("violation_types")
    expanded["severity"] = expanded["violation_types"].map(severity_map).fillna(0.0)
    scores = expanded.groupby("hotspot_id")["severity"].mean().rename("severity_score")
    result = hotspots.merge(scores.reset_index(), on="hotspot_id", how="left")
    result["severity_score"] = result["severity_score"].fillna(0.0)
    return result
