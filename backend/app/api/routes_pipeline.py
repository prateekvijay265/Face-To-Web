from fastapi import APIRouter, File, UploadFile, Request, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from app.services.face_service import face_service, FaceProcessingError

router = APIRouter()

class FaceEncodeResponse(BaseModel):
    detected: bool
    face_count: int
    selected_face: int
    embedding_generated: bool
    model: str
    model_version: str

@router.post("/face/encode", response_model=FaceEncodeResponse)
async def encode_face(
    request: Request,
    image: UploadFile = File(...),
    selected_face_index: Optional[int] = Form(None)
):
    run_id = getattr(request.state, "run_id", "unknown")
    
    image_bytes = await image.read()
    
    try:
        result = face_service.process_face(
            run_id=run_id, 
            image_bytes=image_bytes, 
            selected_face_index=selected_face_index
        )
        
        return FaceEncodeResponse(
            detected=result["detected"],
            face_count=result["face_count"],
            selected_face=result["selected_face"],
            embedding_generated=result["embedding_generated"],
            model=result["model"],
            model_version=result["model_version"]
        )
        
    except FaceProcessingError as e:
        return JSONResponse(
            status_code=400,
            content={
                "error_code": e.error_code,
                "message": e.message,
                "run_id": run_id
            }
        )

from app.services.search_service import search_service
from app.schemas.search import SearchResponse
from app.services.search.base import SearchProviderException

@router.post("/search", response_model=SearchResponse)
async def search_image(
    request: Request,
    image: UploadFile = File(...)
):
    run_id = getattr(request.state, "run_id", "unknown")
    image_bytes = await image.read()
    
    try:
        response = await search_service.search(run_id=run_id, image_bytes=image_bytes)
        return response
    except SearchProviderException as e:
        # Standardize error codes for frontend handling
        status_code = 400
        if e.code == "SEARCH_RATE_LIMITED":
            status_code = 429
        elif e.code == "SEARCH_TIMEOUT":
            status_code = 504
        elif e.code == "SEARCH_AUTH_ERROR":
            status_code = 401
        elif e.code == "NO_SEARCH_RESULTS":
            status_code = 404
            
        return JSONResponse(
            status_code=status_code,
            content={
                "error_code": e.code,
                "message": e.message,
                "run_id": run_id
            }
        )

from pydantic import BaseModel
from app.services.evidence_service import evidence_service, EvidenceRetrievalError
from app.schemas.evidence import EvidenceRecord

class EvidenceRequest(BaseModel):
    url: str

@router.post("/evidence", response_model=EvidenceRecord)
async def retrieve_evidence(
    request: Request,
    payload: EvidenceRequest
):
    run_id = getattr(request.state, "run_id", "unknown")
    
    try:
        record = await evidence_service.retrieve_evidence(payload.url)
        return record
    except EvidenceRetrievalError as e:
        status_code = 400
        if e.code == "SOURCE_UNAVAILABLE":
            status_code = 404
        elif e.code == "SOURCE_BLOCKED":
            status_code = 403
            
        return JSONResponse(
            status_code=status_code,
            content={
                "error_code": e.code,
                "message": e.message,
                "run_id": run_id
            }
        )



from app.services.hash_service import hash_service, HashResponse

class HashRequest(BaseModel):
    source_url: str
    title: str
    text_content: Optional[str] = None
    image_sha256: Optional[str] = None

@router.post('/evidence/hash', response_model=HashResponse)
async def hash_evidence(
    request: Request,
    payload: HashRequest
):
    response = hash_service.generate_evidence_hash(
        source_url=payload.source_url,
        title=payload.title,
        text_content=payload.text_content,
        image_sha256=payload.image_sha256
    )
    return response

from app.services.blockchain_service import get_blockchain_service, BlockchainResponse, BlockchainError

class BlockchainRegisterRequest(BaseModel):
    evidence_hash: str
    schema_version: str

@router.post('/blockchain/register', response_model=BlockchainResponse)
async def register_blockchain(
    request: Request,
    payload: BlockchainRegisterRequest
):
    run_id = getattr(request.state, 'run_id', 'unknown')
    try:
        service = get_blockchain_service()
        response = service.register_evidence(
            evidence_hash=payload.evidence_hash,
            schema_version=payload.schema_version
        )
        return response
    except BlockchainError as e:
        status_code = 400
        if e.code == 'BLOCKCHAIN_RPC_ERROR' or e.code == 'BLOCKCHAIN_CONFIRMATION_TIMEOUT':
            status_code = 503
        elif e.code == 'BLOCKCHAIN_CONFIG_ERROR' or e.code == 'BLOCKCHAIN_CHAIN_MISMATCH':
            status_code = 500
            
        return JSONResponse(
            status_code=status_code,
            content={
                'error_code': e.code,
                'message': e.message,
                'run_id': run_id
            }
        )

from app.services.verification_service import verification_service, VerificationResult

class BlockchainVerifyRequest(BaseModel):
    source_url: str
    expected_hash: str
    transaction_hash: str = None

@router.post('/blockchain/verify', response_model=VerificationResult)
async def verify_blockchain(
    request: Request,
    payload: BlockchainVerifyRequest
):
    from app.services.verification_service import verification_service
    response = await verification_service.verify(
        source_url=payload.source_url,
        expected_hash=payload.expected_hash,
        original_tx_hash=payload.transaction_hash
    )
    return response

from fastapi.responses import StreamingResponse
from app.services.pipeline_service import pipeline_service

@router.post('/pipeline/run')
async def run_pipeline(request: Request, image: UploadFile = File(...)):
    image_bytes = await image.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        return JSONResponse(status_code=413, content={"error_code": "PAYLOAD_TOO_LARGE", "message": "Image size exceeds 10MB limit."})
    return StreamingResponse(pipeline_service.run(image_bytes), media_type='application/x-ndjson')
