import time
import uuid
import json
import logging
from typing import AsyncGenerator

from app.services.face_service import face_service
from app.services.search_service import search_service
from app.services.evidence_service import evidence_service
from app.services.hash_service import hash_service
from app.services.blockchain_service import get_blockchain_service
from app.services.verification_service import verification_service

logger = logging.getLogger("face_blockchain_pipeline")

class PipelineService:
    async def run(self, image_bytes: bytes) -> AsyncGenerator[str, None]:
        run_id = str(uuid.uuid4())
        
        state = {
            "run_id": run_id,
            "status": "RUNNING",
            "current_stage": "RECEIVED",
            "stages": {},
            "data": {}
        }
        
        def update_stage(stage_name, status, duration=None, error=None):
            state["current_stage"] = stage_name
            state["stages"][stage_name] = {
                "status": status,
                "duration": duration,
                "error": error
            }
            
        def yield_state():
            return f"{json.dumps(state)}\n\n"
            
        update_stage("RECEIVED", "SUCCESS", 0)
        yield yield_state()
        
        # 1. Face Detection & Validation
        update_stage("FACE_DETECTION", "PROCESSING")
        yield yield_state()
        
        start_time = time.time()
        try:
            face_result = face_service.process_face(run_id, image_bytes)
            state["data"]["face"] = face_result
            if face_result["face_count"] == 0:
                update_stage("FACE_DETECTION", "FAILED", time.time() - start_time, "NO_FACE")
                state["status"] = "FAILED"
                yield yield_state()
                return
            elif face_result["face_count"] > 1:
                update_stage("FACE_DETECTION", "FAILED", time.time() - start_time, "MULTIPLE_FACES")
                state["status"] = "FAILED"
                yield yield_state()
                return
                
            update_stage("FACE_DETECTION", "SUCCESS", time.time() - start_time)
            yield yield_state()
        except Exception as e:
            update_stage("FACE_DETECTION", "FAILED", time.time() - start_time, "INVALID_IMAGE")
            state["status"] = "FAILED"
            yield yield_state()
            return
            
        # 2. Searching & Candidates
        update_stage("SEARCHING", "PROCESSING")
        yield yield_state()
        
        start_time = time.time()
        try:
            search_result = await search_service.search(run_id, image_bytes)
            
            candidates = search_result.candidates
            if not candidates:
                update_stage("SEARCHING", "FAILED", time.time() - start_time, "NO_MATCH")
                state["status"] = "FAILED"
                yield yield_state()
                return
                
            # Filter matches
            matches = [c for c in candidates if c.match_status == "MATCH"]
            if not matches:
                update_stage("SEARCHING", "FAILED", time.time() - start_time, "NO_MATCH")
                state["status"] = "FAILED"
                yield yield_state()
                return
                
            best_match = matches[0]
            state["data"]["match"] = best_match.model_dump() if hasattr(best_match, "model_dump") else best_match.dict()
            state["data"]["matches"] = [m.model_dump() if hasattr(m, "model_dump") else m.dict() for m in matches]
            update_stage("SEARCHING", "SUCCESS", time.time() - start_time)
            yield yield_state()
        except Exception as e:
            update_stage("SEARCHING", "FAILED", time.time() - start_time, "SEARCH_FAILED")
            state["status"] = "FAILED"
            yield yield_state()
            return
            
        # 3. Evidence Retrieval
        update_stage("EVIDENCE_RETRIEVAL", "PROCESSING")
        yield yield_state()
        
        start_time = time.time()
        try:
            evidence_result = await evidence_service.retrieve_evidence(best_match.url)
            state["data"]["evidence"] = evidence_result.model_dump() if hasattr(evidence_result, "model_dump") else evidence_result.dict()
            
            # fix datetime serialization
            if "retrieved_at" in state["data"]["evidence"] and state["data"]["evidence"]["retrieved_at"]:
                state["data"]["evidence"]["retrieved_at"] = state["data"]["evidence"]["retrieved_at"].isoformat()
                
            update_stage("EVIDENCE_RETRIEVAL", "SUCCESS", time.time() - start_time)
            yield yield_state()
        except Exception as e:
            update_stage("EVIDENCE_RETRIEVAL", "FAILED", time.time() - start_time, "EVIDENCE_RETRIEVAL_FAILED")
            state["status"] = "FAILED"
            yield yield_state()
            return
            
        # 4. Hashing
        update_stage("HASHING", "PROCESSING")
        yield yield_state()
        
        start_time = time.time()
        try:
            hash_result = hash_service.generate_evidence_hash(
                source_url=evidence_result.canonical_url,
                title=evidence_result.title,
                text_content=evidence_result.text_content,
                image_sha256=evidence_result.image_sha256
            )
            state["data"]["fingerprint"] = hash_result.model_dump() if hasattr(hash_result, "model_dump") else hash_result.dict()
            update_stage("HASHING", "SUCCESS", time.time() - start_time)
            yield yield_state()
        except Exception as e:
            update_stage("HASHING", "FAILED", time.time() - start_time, "HASHING_FAILED")
            state["status"] = "FAILED"
            yield yield_state()
            return
            
        # 5. Blockchain
        update_stage("BLOCKCHAIN_SUBMISSION", "PROCESSING")
        yield yield_state()
        
        start_time = time.time()
        try:
            b_service = get_blockchain_service()
            chain_result = b_service.register_evidence(
                evidence_hash=hash_result.evidence_hash,
                schema_version=hash_result.canonicalization_version
            )
            state["data"]["blockchain"] = chain_result.model_dump() if hasattr(chain_result, "model_dump") else chain_result.dict()
            update_stage("BLOCKCHAIN_SUBMISSION", "SUCCESS", time.time() - start_time)
            yield yield_state()
        except Exception as e:
            update_stage("BLOCKCHAIN_SUBMISSION", "FAILED", time.time() - start_time, "BLOCKCHAIN_FAILED")
            state["status"] = "FAILED"
            yield yield_state()
            return
            
        # 6. Verification
        update_stage("VERIFICATION", "PROCESSING")
        yield yield_state()
        
        start_time = time.time()
        try:
            v_result = await verification_service.verify(
                source_url=evidence_result.canonical_url,
                expected_hash=hash_result.evidence_hash,
                original_tx_hash=chain_result.transaction_hash
            )
            state["data"]["verification"] = v_result.model_dump() if hasattr(v_result, "model_dump") else v_result.dict()
            
            if v_result.status != "VERIFIED":
                update_stage("VERIFICATION", "FAILED", time.time() - start_time, "VERIFICATION_FAILED")
                state["status"] = "FAILED"
                yield yield_state()
                return
                
            update_stage("VERIFICATION", "SUCCESS", time.time() - start_time)
            yield yield_state()
        except Exception as e:
            update_stage("VERIFICATION", "FAILED", time.time() - start_time, "VERIFICATION_FAILED")
            state["status"] = "FAILED"
            yield yield_state()
            return
            
        # Final success
        state["status"] = "COMPLETED"
        state["current_stage"] = "COMPLETED"
        yield yield_state()

pipeline_service = PipelineService()
