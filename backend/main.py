from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    ConfidenceDistributionResponse,
    DashboardResponse,
    EmergingHotspotResponse,
    EmergingStatsResponse,
    HealthResponse,
    HotspotResponse,
    PlannerRecommendation,
    SimulatorResponse,
    SummaryResponse,
    TIIWeightsResponse,
)
from services.emerging import compute_emerging_hotspots
from services.hotspots import compute_hotspots
from services.planner import build_deployment_plan
from services.preprocessing import load_cache, preprocess_dataset, save_cache
from services.reliability import attach_hotspot_reliability, compute_device_reliability
from services.severity import attach_hotspot_severity, compute_violation_severity
from services.simulator import simulate_enforcement
from services.tii import compute_tii


STATE: dict = {
    "ready": False,
    "dataset_path": None,
    "total_violations": 0,
    "hotspots": [],
    "emerging": [],
    "summary": {},
    "weights": {},
}

ANALYTICS_CACHE_NAME = "analytics_capped_weights_v1"


def _round(value: float, digits: int = 4) -> float:
    return round(float(value), digits)


def _hotspot_records(hotspots):
    records = []
    for row in hotspots.to_dict(orient="records"):
        records.append(
            {
                "hotspot_id": row["hotspot_id"],
                "location": row["location"],
                "latitude": _round(row["latitude_center"], 6),
                "longitude": _round(row["longitude_center"], 6),
                "confidence_level": row["confidence_level"],
                "violation_count": int(row["violation_count"]),
                "peak_hour": int(row["peak_hour"]),
                "D": _round(row["D"]),
                "S": _round(row["S"]),
                "J": _round(row["J"]),
                "P": _round(row["P"]),
                "TII": _round(row["TII"], 2),
            }
        )
    return records


def _emerging_records(emerging):
    records = []
    for row in emerging.to_dict(orient="records"):
        records.append(
            {
                "hotspot_id": row["hotspot_id"],
                "location": row["location"],
                "historical_avg": _round(row["historical_avg"]),
                "recent_avg": _round(row["recent_avg"]),
                "escalation_pct": _round(row["escalation_pct"], 2),
                "is_emerging": bool(row["is_emerging"]),
            }
        )
    return records


def _weight_records(weights: dict) -> dict:
    return {
        "density_weight": _round(weights.get("weight_D", 0.0), 6),
        "severity_weight": _round(weights.get("weight_S", 0.0), 6),
        "junction_weight": _round(weights.get("weight_J", 0.0), 6),
        "peak_weight": _round(weights.get("weight_P", 0.0), 6),
    }


def _confidence_distribution(hotspots) -> dict:
    counts = (
        hotspots["confidence_level"].value_counts().to_dict()
        if not hotspots.empty
        else {}
    )
    return {
        "High Confidence": int(counts.get("High Confidence", 0)),
        "Medium Confidence": int(counts.get("Medium Confidence", 0)),
        "Low Confidence": int(counts.get("Low Confidence", 0)),
    }


def _emerging_stats(emerging) -> dict:
    if emerging.empty:
        return {
            "total_hotspots": 0,
            "emerging_hotspots": 0,
            "emerging_percentage": 0.0,
            "threshold": 50,
            "median_escalation": 0.0,
            "p90_escalation": 0.0,
            "max_escalation": 0.0,
        }

    total_hotspots = int(len(emerging))
    emerging_hotspots = int(emerging["is_emerging"].sum())
    escalation = emerging["escalation_pct"].fillna(0.0)
    return {
        "total_hotspots": total_hotspots,
        "emerging_hotspots": emerging_hotspots,
        "emerging_percentage": _round((emerging_hotspots / total_hotspots) * 100, 2),
        "threshold": 50,
        "median_escalation": _round(escalation.median(), 2),
        "p90_escalation": _round(escalation.quantile(0.90), 2),
        "max_escalation": _round(escalation.max(), 2),
    }


def build_analytics() -> None:
    df, dataset_path, fingerprint = preprocess_dataset()
    cached = load_cache(ANALYTICS_CACHE_NAME, fingerprint)
    if cached is None:
        hotspots = compute_hotspots(df)
        device_reliability, baseline, _ = compute_device_reliability(df)
        hotspots = attach_hotspot_reliability(df, hotspots, device_reliability, baseline)
        severity_map = compute_violation_severity(df)
        hotspots = attach_hotspot_severity(df, hotspots, severity_map)
        hotspots, weights = compute_tii(hotspots)
        emerging = compute_emerging_hotspots(df, hotspots)
        cached = {
            "hotspots": hotspots,
            "emerging": emerging,
            "weights": weights,
            "total_violations": int(len(df)),
        }
        save_cache(ANALYTICS_CACHE_NAME, fingerprint, cached)

    hotspots = cached["hotspots"]
    emerging = cached["emerging"]
    summary = {
        "total_violations": int(cached["total_violations"]),
        "hotspots_count": int(len(hotspots)),
        "emerging_count": int(emerging["is_emerging"].sum()) if not emerging.empty else 0,
        "avg_city_tii": _round(hotspots["TII"].mean() if not hotspots.empty else 0.0, 2),
    }

    STATE.update(
        {
            "ready": True,
            "dataset_path": str(dataset_path),
            "total_violations": int(cached["total_violations"]),
            "hotspots_df": hotspots,
            "emerging_df": emerging,
            "hotspots": _hotspot_records(hotspots),
            "emerging": _emerging_records(emerging),
            "summary": summary,
            "weights": cached["weights"],
            "weights_response": _weight_records(cached["weights"]),
            "confidence_distribution": _confidence_distribution(hotspots),
            "emerging_stats": _emerging_stats(emerging),
        }
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    build_analytics()
    yield


app = FastAPI(
    title="ParkWise Analytics API",
    description="Backend-only analytics API for AI-Powered Parking Intelligence.",
    version="1.0.0",
    lifespan=lifespan,
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ensure_ready() -> None:
    if not STATE["ready"]:
        raise HTTPException(status_code=503, detail="Analytics engine is still starting")


@app.get("/health", response_model=HealthResponse)
def health() -> dict:
    return {
        "status": "ready" if STATE["ready"] else "starting",
        "dataset_path": STATE["dataset_path"],
        "total_violations": STATE["total_violations"],
        "message": "ParkWise backend is ready",
    }


@app.get("/api/summary", response_model=SummaryResponse)
def summary() -> dict:
    ensure_ready()
    return STATE["summary"]


@app.get("/api/hotspots", response_model=list[HotspotResponse])
def hotspots(limit: int | None = Query(default=None, ge=1, le=10000)) -> list[dict]:
    ensure_ready()
    records = STATE["hotspots"]
    return records[:limit] if limit else records


@app.get("/api/emerging", response_model=list[EmergingHotspotResponse])
def emerging(only_flagged: bool = True) -> list[dict]:
    ensure_ready()
    records = STATE["emerging"]
    if only_flagged:
        return [record for record in records if record["is_emerging"]]
    return records


@app.get("/api/planner", response_model=list[PlannerRecommendation])
def planner(wardens: int = Query(default=10, ge=0, le=10000)) -> list[dict]:
    ensure_ready()
    return build_deployment_plan(STATE["hotspots_df"], STATE["emerging_df"], wardens)


@app.get("/api/simulator", response_model=SimulatorResponse)
def simulator(wardens: int = Query(default=10, ge=0, le=10000)) -> dict:
    ensure_ready()
    return simulate_enforcement(STATE["hotspots_df"], wardens, STATE["weights"])


@app.get("/api/debug/weights", response_model=TIIWeightsResponse)
def debug_weights() -> dict:
    ensure_ready()
    return STATE["weights_response"]


@app.get(
    "/api/debug/confidence-distribution",
    response_model=ConfidenceDistributionResponse,
)
def debug_confidence_distribution() -> dict:
    ensure_ready()
    return STATE["confidence_distribution"]


@app.get("/api/debug/emerging-stats", response_model=EmergingStatsResponse)
def debug_emerging_stats() -> dict:
    ensure_ready()
    return STATE["emerging_stats"]


@app.get("/api/dashboard", response_model=DashboardResponse)
def dashboard() -> dict:
    ensure_ready()
    return {
        "summary": STATE["summary"],
        "weights": STATE["weights_response"],
        "confidence_distribution": STATE["confidence_distribution"],
        "hotspots": STATE["hotspots"],
        "emerging": [record for record in STATE["emerging"] if record["is_emerging"]],
    }
