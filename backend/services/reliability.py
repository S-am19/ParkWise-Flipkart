import numpy as np
import pandas as pd


def compute_device_reliability(df: pd.DataFrame) -> tuple[pd.DataFrame, float, float]:
    empty = pd.DataFrame(
        columns=["device_id", "rejection_rate", "validated_records", "is_flagged"]
    )
    valid = df[df["validation_status"].isin(["approved", "rejected"])].copy()
    if valid.empty:
        return empty, 0.0, 0.0

    pivot = (
        valid.groupby(["device_id", "validation_status"])
        .size()
        .unstack(fill_value=0)
        .reset_index()
    )
    for column in ["approved", "rejected"]:
        if column not in pivot.columns:
            pivot[column] = 0

    pivot["validated_records"] = pivot["approved"] + pivot["rejected"]
    pivot = pivot[pivot["validated_records"] >= 100].copy()
    if pivot.empty:
        return empty, 0.0, 0.0

    pivot["rejection_rate"] = pivot["rejected"] / pivot["validated_records"]
    mean_rate = float(pivot["rejection_rate"].mean())
    std_rate = float(pivot["rejection_rate"].std(ddof=0) or 0.0)
    threshold = mean_rate + (1.5 * std_rate)
    pivot["is_flagged"] = pivot["rejection_rate"] > threshold

    return (
        pivot[["device_id", "rejection_rate", "validated_records", "is_flagged"]]
        .sort_values("rejection_rate", ascending=False)
        .reset_index(drop=True),
        mean_rate,
        std_rate,
    )


def attach_hotspot_reliability(
    df: pd.DataFrame,
    hotspots: pd.DataFrame,
    device_reliability: pd.DataFrame,
    baseline: float,
) -> pd.DataFrame:
    if hotspots.empty:
        return hotspots

    rate_map = dict(zip(device_reliability["device_id"], device_reliability["rejection_rate"]))
    working = df[["hotspot_id", "device_id"]].copy()
    working["device_rejection_rate"] = working["device_id"].map(rate_map).fillna(baseline)
    hotspot_rates = (
        working.groupby("hotspot_id")["device_rejection_rate"]
        .mean()
        .rename("hotspot_reliability")
        .reset_index()
    )

    result = hotspots.merge(hotspot_rates, on="hotspot_id", how="left")
    result["hotspot_reliability"] = result["hotspot_reliability"].fillna(baseline)

    # Reliability penalty grows only above the global device baseline. The excess
    # rejection rate is scaled by the largest possible excess (1 - baseline), so
    # effective_count remains deterministic, bounded, and comparable across runs.
    denominator = max(1.0 - baseline, 1e-9)
    excess = (result["hotspot_reliability"] - baseline).clip(lower=0)
    result["reliability_penalty"] = (excess / denominator).clip(0, 0.9)
    result["effective_count"] = result["raw_count"] * (1 - result["reliability_penalty"])

    conditions = [
        result["hotspot_reliability"] <= baseline,
        result["hotspot_reliability"] <= baseline + 0.10,
    ]
    choices = ["High Confidence", "Medium Confidence"]
    result["confidence_level"] = np.select(conditions, choices, default="Low Confidence")
    return result
