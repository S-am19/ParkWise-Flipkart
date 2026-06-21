from pydantic import BaseModel, Field


class SummaryResponse(BaseModel):
    total_violations: int
    hotspots_count: int
    emerging_count: int
    avg_city_tii: float


class HotspotResponse(BaseModel):
    hotspot_id: str
    location: str
    latitude: float
    longitude: float
    confidence_level: str
    violation_count: int
    peak_hour: int
    D: float
    S: float
    J: float
    P: float
    TII: float


class EmergingHotspotResponse(BaseModel):
    hotspot_id: str
    location: str
    historical_avg: float
    recent_avg: float
    escalation_pct: float
    is_emerging: bool


class PlannerRecommendation(BaseModel):
    team: str
    hotspot_id: str
    location: str
    latitude: float
    longitude: float
    TII: float
    is_emerging: bool
    recommendation: str


class SimulatorResponse(BaseModel):
    current_city_tii: float
    future_city_tii: float
    improvement_pct: float


class TIIWeightsResponse(BaseModel):
    density_weight: float
    severity_weight: float
    junction_weight: float
    peak_weight: float


class ConfidenceDistributionResponse(BaseModel):
    High_Confidence: int = Field(alias="High Confidence")
    Medium_Confidence: int = Field(alias="Medium Confidence")
    Low_Confidence: int = Field(alias="Low Confidence")


class EmergingStatsResponse(BaseModel):
    total_hotspots: int
    emerging_hotspots: int
    emerging_percentage: float
    threshold: int
    median_escalation: float
    p90_escalation: float
    max_escalation: float


class DashboardResponse(BaseModel):
    summary: SummaryResponse
    weights: TIIWeightsResponse
    confidence_distribution: ConfidenceDistributionResponse
    hotspots: list[HotspotResponse]
    emerging: list[EmergingHotspotResponse]


class HealthResponse(BaseModel):
    status: str
    dataset_path: str | None = None
    total_violations: int = 0
    message: str = Field(default="ParkWise backend is ready")
