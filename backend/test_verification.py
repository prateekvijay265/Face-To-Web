import asyncio
import os
from app.services.verification_service import verification_service
from app.services.blockchain_service import get_blockchain_service

# To fake a source unavailable, we can use a dummy URL that won't resolve or mock the service,
# but for a true integration test, we can mock `evidence_service` inside the test context.
from app.services.evidence_service import evidence_service
from app.schemas.evidence import EvidenceRecord
from app.services.hash_service import hash_service

async def run_verification_test():
    print("Running Verification Tests...")
    v_service = verification_service
    b_service = get_blockchain_service()
    
    # 1. Unknown Hash
    print("Test 1: Unknown Hash")
    unknown_hash = "0x0000000000000000000000000000000000000000000000000000000000000000"
    res1 = await v_service.verify("https://example.com", unknown_hash)
    assert res1.status == "ON_CHAIN_RECORD_NOT_FOUND"
    print("  -> Passed (ON_CHAIN_RECORD_NOT_FOUND)")
    
    # Setup for successful validation (use a hash we know we just registered in Phase 9 smoke test)
    # 0x8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c91
    # But wait, to get VERIFIED, the "fresh extraction" must yield EXACTLY that hash.
    # We can mock the extraction in evidence_service for the sake of the test.
    
    original_extract = evidence_service.retrieve_evidence
    
    from datetime import datetime, timezone
    # Create a stable mock record
    stable_record = EvidenceRecord(
        source_url="https://test.com/profile",
        canonical_url="https://test.com/profile",
        title="Test Profile",
        text_content="Test Description",
        image_sha256="d455867677619440fafa5838ebf1cf8c2f863797abff4718c33d4f79f7ef3cb9",
        content_type="text/html",
        provider="EvidenceService",
        retrieved_at=datetime.now(timezone.utc),
        retrieval_metadata={"bytes": 0}
    )
    
    stable_hash = hash_service.generate_evidence_hash(
        source_url=stable_record.canonical_url,
        title=stable_record.title,
        text_content=stable_record.text_content,
        image_sha256=stable_record.image_sha256
    ).evidence_hash
    
    # Register the stable hash manually for this test if it isn't registered
    print(f"Ensuring {stable_hash} is registered for test...")
    b_service.register_evidence(stable_hash, "1.0")
    
    print("Test 2: VERIFIED")
    async def mock_extract_success(url):
        return stable_record
    evidence_service.retrieve_evidence = mock_extract_success
    
    res2 = await v_service.verify("https://test.com/profile", stable_hash)
    assert res2.status == "VERIFIED"
    assert res2.verified == True
    print("  -> Passed (VERIFIED)")
    
    print("Test 3: HASH_MISMATCH (text changed)")
    tampered_record = EvidenceRecord(
        source_url="https://test.com/profile",
        canonical_url="https://test.com/profile",
        title="Test Profile",
        text_content="Test Description MODIFIED",
        image_sha256="d455867677619440fafa5838ebf1cf8c2f863797abff4718c33d4f79f7ef3cb9",
        content_type="text/html",
        provider="EvidenceService",
        retrieved_at=datetime.now(timezone.utc),
        retrieval_metadata={"bytes": 0}
    )
    async def mock_extract_tampered(url):
        return tampered_record
    evidence_service.retrieve_evidence = mock_extract_tampered
    
    res3 = await v_service.verify("https://test.com/profile", stable_hash)
    assert res3.status == "HASH_MISMATCH"
    assert res3.tampered == True
    print("  -> Passed (HASH_MISMATCH)")
    
    print("Test 4: VERIFICATION_UNAVAILABLE")
    async def mock_extract_fail(url):
        raise Exception("404 Not Found")
    evidence_service.retrieve_evidence = mock_extract_fail
    
    res4 = await v_service.verify("https://test.com/profile", stable_hash)
    assert res4.status == "VERIFICATION_UNAVAILABLE"
    print("  -> Passed (VERIFICATION_UNAVAILABLE)")
    
    evidence_service.retrieve_evidence = original_extract
    print("All verification tests passed!")

if __name__ == "__main__":
    asyncio.run(run_verification_test())
