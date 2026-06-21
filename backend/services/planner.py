import pandas as pd


def build_deployment_plan(hotspots: pd.DataFrame, emerging: pd.DataFrame, wardens: int) -> list[dict]:
    wardens = max(int(wardens), 0)
    if wardens == 0 or hotspots.empty:
        return []

    emerging_map = dict(zip(emerging["hotspot_id"], emerging["is_emerging"]))
    ranked = hotspots.copy()
    ranked["is_emerging"] = ranked["hotspot_id"].map(emerging_map).fillna(False).astype(bool)
    ranked["priority_score"] = ranked["TII"] * ranked["is_emerging"].map({True: 1.25, False: 1.0})
    ranked = ranked.sort_values(["priority_score", "TII"], ascending=False)

    recommendations = []
    seen_locations = set()
    for _, row in ranked.iterrows():
        location = row["location"]
        if location in seen_locations:
            continue

        seen_locations.add(location)
        team = f"Deploy Team {len(recommendations) + 1}"
        recommendations.append(
            {
                "team": team,
                "hotspot_id": row["hotspot_id"],
                "location": location,
                "latitude": round(float(row["latitude_center"]), 6),
                "longitude": round(float(row["longitude_center"]), 6),
                "TII": round(float(row["TII"]), 2),
                "is_emerging": bool(row["is_emerging"]),
                "recommendation": f"{team} -> {location}",
            }
        )

        if len(recommendations) == wardens:
            break

    return recommendations
