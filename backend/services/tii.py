import numpy as np
import pandas as pd


MAX_COMPONENT_WEIGHT = 0.40


def _normalize(series: pd.Series) -> pd.Series:
    minimum = float(series.min())
    maximum = float(series.max())
    if np.isclose(maximum, minimum):
        return pd.Series(0.0, index=series.index)
    return (series - minimum) / (maximum - minimum)


def _capped_variance_weights(variances: dict[str, float]) -> dict[str, float]:
    total_variance = sum(variances.values())
    if np.isclose(total_variance, 0.0):
        return {key: 0.25 for key in variances}

    weights = {key: value / total_variance for key, value in variances.items()}
    capped: dict[str, float] = {}
    remaining = set(weights)
    remaining_weight = 1.0

    while remaining:
        remaining_raw_total = sum(weights[key] for key in remaining)
        if np.isclose(remaining_raw_total, 0.0):
            equal_share = remaining_weight / len(remaining)
            for key in remaining:
                capped[key] = min(equal_share, MAX_COMPONENT_WEIGHT)
            break

        changed = False
        for key in list(remaining):
            candidate = weights[key] / remaining_raw_total * remaining_weight
            if candidate > MAX_COMPONENT_WEIGHT:
                capped[key] = MAX_COMPONENT_WEIGHT
                remaining.remove(key)
                remaining_weight -= MAX_COMPONENT_WEIGHT
                changed = True

        if not changed:
            for key in remaining:
                capped[key] = weights[key] / remaining_raw_total * remaining_weight
            break

    capped_total = sum(capped.values())
    if np.isclose(capped_total, 0.0):
        return {key: 0.25 for key in variances}
    return {key: value / capped_total for key, value in capped.items()}


def compute_tii(hotspots: pd.DataFrame) -> tuple[pd.DataFrame, dict[str, float]]:
    if hotspots.empty:
        return hotspots, {"weight_D": 0.25, "weight_S": 0.25, "weight_J": 0.25, "weight_P": 0.25}

    result = hotspots.copy()
    result["D"] = result["effective_count"].rank(pct=True, method="average")
    result["S"] = _normalize(result["severity_score"])
    result["J"] = result["junction_ratio"].clip(0, 1)
    result["P"] = result["hourly_distribution"].apply(
        lambda hourly: max(hourly.values()) / max(sum(hourly.values()), 1)
    )

    variances = {
        "D": float(result["D"].var(ddof=0)),
        "S": float(result["S"].var(ddof=0)),
        "J": float(result["J"].var(ddof=0)),
        "P": float(result["P"].var(ddof=0)),
    }
    weights = _capped_variance_weights(variances)

    result["TII"] = 100 * (
        weights["D"] * result["D"]
        + weights["S"] * result["S"]
        + weights["J"] * result["J"]
        + weights["P"] * result["P"]
    )
    result = result.sort_values("TII", ascending=False).reset_index(drop=True)
    return result, {f"weight_{key}": value for key, value in weights.items()}
