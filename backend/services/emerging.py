import numpy as np
import pandas as pd


def compute_emerging_hotspots(df: pd.DataFrame, hotspots: pd.DataFrame) -> pd.DataFrame:
    if hotspots.empty or df.empty:
        return pd.DataFrame(
            columns=[
                "hotspot_id",
                "location",
                "historical_avg",
                "recent_avg",
                "escalation_pct",
                "is_emerging",
            ]
        )

    max_date = df["created_datetime"].dt.normalize().max()
    recent_start = max_date - pd.Timedelta(days=6)
    working = df[["hotspot_id", "created_datetime"]].copy()
    working["day"] = working["created_datetime"].dt.normalize()

    recent = working[working["day"] >= recent_start]
    historical = working[working["day"] < recent_start]

    recent_counts = recent.groupby("hotspot_id").size() / 7.0
    historical_days = max(int((recent_start - working["day"].min()).days), 1)
    historical_counts = historical.groupby("hotspot_id").size() / float(historical_days)

    result = hotspots[["hotspot_id", "location"]].copy()
    result["recent_avg"] = result["hotspot_id"].map(recent_counts).fillna(0.0)
    result["historical_avg"] = result["hotspot_id"].map(historical_counts).fillna(0.0)
    result["escalation_pct"] = np.where(
        result["historical_avg"] > 0,
        ((result["recent_avg"] - result["historical_avg"]) / result["historical_avg"]) * 100,
        np.where(result["recent_avg"] > 0, 100.0, 0.0),
    )
    result["is_emerging"] = result["escalation_pct"] > 50
    return result.sort_values(["is_emerging", "escalation_pct"], ascending=False).reset_index(drop=True)
