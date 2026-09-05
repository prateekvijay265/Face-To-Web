from pydantic import BaseModel, Field
from typing import List, Optional

class SearchCandidate(BaseModel):
    url: str
    title: str
    thumbnail: Optional[str] = None
    source: str
    confidence: Optional[float] = None
    provider_result_id: Optional[str] = None
    rank: int
    metadata: dict = {}
    match_status: Optional[str] = Field(None, description="MATCH_CONFIRMED, MATCH_POSSIBLE, or NO_MATCH")
    application_score: Optional[float] = Field(None, description="Score calculated by application")

class SearchResponse(BaseModel):
    run_id: str
    provider: str
    status: str
    results_found: int
    candidates: List[SearchCandidate]
