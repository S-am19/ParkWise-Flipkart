import pandas as pd


def simulate_enforcement(
    hotspots: pd.DataFrame,
    wardens: int,
    weights: dict[str, float] | None = None,
) -> dict[str, float]:
    wardens = max(int(wardens), 0)
    if hotspots.empty:
        return {"current_city_tii": 0.0, "future_city_tii": 0.0, "improvement_pct": 0.0}

    current_city_tii = float(hotspots["TII"].mean())
    future = hotspots.copy()
    selected = future.sort_values("TII", ascending=False).head(wardens).index
    future.loc[selected, "D"] = future.loc[selected, "D"] * 0.60

    weights = weights or {}
    density_weight = float(weights.get("weight_D", 0.25))
    severity_weight = float(weights.get("weight_S", 0.25))
    junction_weight = float(weights.get("weight_J", 0.25))
    peak_weight = float(weights.get("weight_P", 0.25))

    future["future_TII"] = 100 * (
        density_weight * future["D"]
        + severity_weight * future["S"]
        + junction_weight * future["J"]
        + peak_weight * future["P"]
    )
    future["future_TII"] = future["future_TII"].clip(lower=0)
    future_city_tii = float(future["future_TII"].mean())
    improvement_pct = (
        ((current_city_tii - future_city_tii) / current_city_tii) * 100
        if current_city_tii > 0
        else 0.0
    )

    return {
        "current_city_tii": round(current_city_tii, 2),
        "future_city_tii": round(future_city_tii, 2),
        "improvement_pct": round(float(improvement_pct), 2),
    }
