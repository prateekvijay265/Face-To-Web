from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class EvidenceRecord(BaseModel):
    source_url: str
    canonical_url: str
    title: str
    text_content: Optional[str] = None
    image_sha256: Optional[str] = None
    content_type: str
    retrieved_at: datetime
    provider: str
    retrieval_metadata: dict = {}
