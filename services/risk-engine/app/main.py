import os
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(
    title="NIRVANA AI Risk Engine",
    description="Rule-based risk scoring and weather integration microservice for Northeast India logistics",
    version="1.0.0"
)

# Request / Response Schemas
class PredictionRequest(BaseModel):
    origin: str
    destination: str
    vehicle_type: str = "truck"
    rainfall_mm: Optional[float] = 0.0
    hazard_zone_flag: Optional[bool] = False
    open_report_count: Optional[int] = 0

class RiskFactorBreakdown(BaseModel):
    rainfall_score: float
    hazard_zone_score: float
    report_density_score: float
    historical_score: float
    total_score: float

class PredictionResponse(BaseModel):
    success: bool
    risk_score: float = Field(..., ge=0.0, le=1.0)
    risk_level: str  # "Low Risk", "Moderate Risk", "High Risk / Hazard"
    status: str
    warnings: List[str]
    breakdown: Optional[RiskFactorBreakdown] = None
    factors: Dict[str, Any]

def calculate_rule_based_risk(rainfall_mm: float, is_hazard_zone: bool, open_reports: int) -> Dict[str, Any]:
    """
    Weighted rule-based risk scoring:
    w1: rainfall (35%)
    w2: hazard zone (25%)
    w3: report density (30%)
    w4: baseline terrain factor (10%)
    """
    # Rainfall factor
    if rainfall_mm > 60:
        rf_score = 1.0
    elif rainfall_mm > 30:
        rf_score = 0.7
    elif rainfall_mm > 10:
        rf_score = 0.4
    else:
        rf_score = 0.1

    # Hazard zone factor
    hz_score = 1.0 if is_hazard_zone else 0.1

    # Open reports factor
    if open_reports >= 3:
        rp_score = 1.0
    elif open_reports == 2:
        rp_score = 0.7
    elif open_reports == 1:
        rp_score = 0.4
    else:
        rp_score = 0.0

    terrain_score = 0.3  # NER mountainous terrain baseline

    w1, w2, w3, w4 = 0.35, 0.25, 0.30, 0.10
    total = (w1 * rf_score) + (w2 * hz_score) + (w3 * rp_score) + (w4 * terrain_score)
    total = min(1.0, max(0.0, round(total, 2)))

    warnings = []
    if rf_score >= 0.7:
        warnings.append(f"Heavy rainfall detected ({rainfall_mm}mm) - high landslide risk in hill sectors")
    if is_hazard_zone:
        warnings.append("Route intersects designated critical flood/landslide hazard zone")
    if open_reports > 0:
        warnings.append(f"{open_reports} active crowd-sourced hazard report(s) along the corridor")

    if total >= 0.65:
        risk_level = "High Risk / Hazard"
        status = "Blocked / High Risk"
    elif total >= 0.35:
        risk_level = "Moderate Risk"
        status = "Risky"
    else:
        risk_level = "Low Risk"
        status = "Open / Safe"

    return {
        "risk_score": total,
        "risk_level": risk_level,
        "status": status,
        "warnings": warnings if warnings else ["Normal driving conditions, proceed with standard mountain precautions"],
        "breakdown": RiskFactorBreakdown(
            rainfall_score=rf_score,
            hazard_zone_score=hz_score,
            report_density_score=rp_score,
            historical_score=terrain_score,
            total_score=total
        )
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "nirvana-risk-engine", "version": "1.0.0"}

@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict_route_risk(payload: PredictionRequest):
    result = calculate_rule_based_risk(
        rainfall_mm=payload.rainfall_mm or 15.0,
        is_hazard_zone=payload.hazard_zone_flag or False,
        open_reports=payload.open_report_count or 0
    )
    return PredictionResponse(
        success=True,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        status=result["status"],
        warnings=result["warnings"],
        breakdown=result["breakdown"],
        factors={
            "origin": payload.origin,
            "destination": payload.destination,
            "vehicle_type": payload.vehicle_type,
            "rainfall_mm": payload.rainfall_mm or 15.0,
            "hazard_zone_flag": payload.hazard_zone_flag,
            "open_report_count": payload.open_report_count
        }
    )

@app.get("/api/v1/segment/{segment_id}/risk")
def get_segment_risk(segment_id: int):
    # Default rule-based assessment for segment
    result = calculate_rule_based_risk(rainfall_mm=25.0, is_hazard_zone=True, open_reports=1)
    return {
        "segment_id": segment_id,
        "success": True,
        **result
    }

@app.post("/api/v1/batch-update")
def batch_update_segments(segment_ids: List[int]):
    updates = []
    for sid in segment_ids:
        res = calculate_rule_based_risk(rainfall_mm=10.0, is_hazard_zone=False, open_reports=0)
        updates.append({"segment_id": sid, "risk_score": res["risk_score"], "status": res["status"]})
    return {"success": True, "updated_count": len(updates), "results": updates}
