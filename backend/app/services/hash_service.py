import hashlib
from app.services.canonicalizer import canonicalizer
from pydantic import BaseModel
from typing import Optional

class HashResponse(BaseModel):
    hash_algorithm: str
    canonicalization_version: str
    evidence_hash: str

class HashService:
    def __init__(self):
        self.algorithm = "SHA-256"
        
    def generate_evidence_hash(
        self,
        source_url: str,
        title: str,
        text_content: Optional[str],
        image_sha256: Optional[str]
    ) -> HashResponse:
        
        canonical_bytes = canonicalizer.canonicalize(
            source_url=source_url,
            title=title,
            text_content=text_content,
            image_sha256=image_sha256
        )
        
        evidence_hash = hashlib.sha256(canonical_bytes).hexdigest()
        
        return HashResponse(
            hash_algorithm=self.algorithm,
            canonicalization_version=canonicalizer.version,
            evidence_hash=evidence_hash
        )

hash_service = HashService()
