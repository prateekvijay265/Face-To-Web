from pydantic import BaseModel
from typing import Optional
from app.services.evidence_service import evidence_service
from app.services.hash_service import hash_service
from app.services.blockchain_service import get_blockchain_service, BlockchainError

class VerificationResult(BaseModel):
    status: str
    verified: bool
    tampered: bool
    local_hash: Optional[str] = None
    on_chain_hash: Optional[str] = None
    transaction_hash: Optional[str] = None

class VerificationService:
    async def verify(self, source_url: str, expected_hash: str, original_tx_hash: str = None) -> VerificationResult:
        chain_svc = get_blockchain_service()
        
        # 1. Query blockchain for expected_hash
        try:
            hash_bytes = chain_svc.w3.to_bytes(hexstr=expected_hash)
            if len(hash_bytes) != 32:
                return VerificationResult(status="ON_CHAIN_RECORD_NOT_FOUND", verified=False, tampered=False)
                
            is_registered = chain_svc.contract.functions.verifyContent(hash_bytes).call()
            if not is_registered:
                return VerificationResult(status="ON_CHAIN_RECORD_NOT_FOUND", verified=False, tampered=False)
        except Exception:
            return VerificationResult(status="ON_CHAIN_RECORD_NOT_FOUND", verified=False, tampered=False)
            
        # 2. Retrieve current evidence (Fresh Retrieval)
        try:
            fresh_evidence = await evidence_service.retrieve_evidence(source_url)
        except Exception as e:
            return VerificationResult(
                status="VERIFICATION_UNAVAILABLE", 
                verified=False, 
                tampered=False,
                on_chain_hash=expected_hash,
                transaction_hash=original_tx_hash
            )
            
        # 3. Canonicalize & Hash (Fresh)
        try:
            fresh_hash_record = hash_service.generate_evidence_hash(
                source_url=fresh_evidence.canonical_url, # Ensure we use what we actually retrieved
                title=fresh_evidence.title,
                text_content=fresh_evidence.text_content,
                image_sha256=fresh_evidence.image_sha256
            )
            fresh_hash = fresh_hash_record.evidence_hash
        except Exception:
            return VerificationResult(
                status="VERIFICATION_UNAVAILABLE", 
                verified=False, 
                tampered=False,
                on_chain_hash=expected_hash,
                transaction_hash=original_tx_hash
            )
        
        # 4. Compare
        if fresh_hash == expected_hash:
            return VerificationResult(
                status="VERIFIED",
                verified=True,
                tampered=False,
                local_hash=fresh_hash,
                on_chain_hash=expected_hash,
                transaction_hash=original_tx_hash
            )
        else:
            return VerificationResult(
                status="HASH_MISMATCH",
                verified=False,
                tampered=True,
                local_hash=fresh_hash,
                on_chain_hash=expected_hash,
                transaction_hash=original_tx_hash
            )

verification_service = VerificationService()
