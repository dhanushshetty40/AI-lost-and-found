from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ModelMetric(BaseModel):
    model_name: str
    modality: str  # "TEXT", "IMAGE", or "MULTIMODAL"
    architecture: str
    precision: float
    recall: float
    f1_score: float
    top1_accuracy: float
    top3_accuracy: float
    mrr: float  # Mean Reciprocal Rank
    avg_latency_ms: float
    description: str
    strengths: List[str]
    limitations: List[str]

class DatasetSummary(BaseModel):
    dataset_name: str
    source: str
    license: str
    total_records: int
    lost_records: int
    found_records: int
    labeled_matching_pairs: int
    categories_covered: int
    evaluation_split: str

class ExperimentBenchmarkResponse(BaseModel):
    dataset_summary: DatasetSummary
    text_models: List[ModelMetric]
    image_models: List[ModelMetric]
    multimodal_fusion: ModelMetric
    recommended_pipeline: str
    benchmark_timestamp: str

class LiveComparisonRequest(BaseModel):
    query_text: str
    candidate_text: str
    category: Optional[str] = "Electronics & Gadgets"

class ModelPredictionResult(BaseModel):
    model_name: str
    similarity_score: float  # 0 to 100
    latency_ms: float
    decision: str  # "MATCH", "POTENTIAL", "NO_MATCH"
    features_used: List[str]

class LiveComparisonResponse(BaseModel):
    query_text: str
    candidate_text: str
    category: str
    results: List[ModelPredictionResult]
    best_matching_model: str
    explainable_breakdown: str
