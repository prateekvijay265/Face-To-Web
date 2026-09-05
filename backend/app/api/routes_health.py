from fastapi import APIRouter
from pydantic import BaseModel
from app.config import settings
from app.utils.logging import get_current_timestamp

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    app_version: str
    environment: str
    timestamp: str

@router.get("/health", response_model=HealthResponse)
async def get_health():
    return HealthResponse(
        status="ok",
        app_version=settings.app_version,
        environment=settings.environment,
        timestamp=get_current_timestamp()
    )
