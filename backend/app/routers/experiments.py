from fastapi import APIRouter, Depends, HTTPException
from app.schemas.experiment import (
    ExperimentBenchmarkResponse,
    LiveComparisonRequest,
    LiveComparisonResponse
)
from app.deps import get_current_user
from app.models.user import User
from app.services.ml_experiment_service import get_benchmark_metrics, run_live_comparison

router = APIRouter(prefix="/experiments", tags=["AI/ML Model Benchmarking & Experimentation"])


@router.get("/benchmark", response_model=ExperimentBenchmarkResponse)
def get_model_benchmarks(
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve empirical benchmark metrics comparing Text, Image, and Multimodal matching models.
    """
    return get_benchmark_metrics()


@router.post("/compare", response_model=LiveComparisonResponse)
def compare_models_live(
    payload: LiveComparisonRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Execute live side-by-side similarity evaluation across AI algorithms for a test query and candidate.
    """
    if not payload.query_text or not payload.candidate_text:
        raise HTTPException(status_code=400, detail="Both query_text and candidate_text are required for comparison.")

    return run_live_comparison(payload.query_text, payload.candidate_text, payload.category or "Electronics & Gadgets")
