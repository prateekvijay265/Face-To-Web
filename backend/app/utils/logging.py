import logging
import uuid
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Callable
from datetime import datetime, timezone

# Structured logger
logger = logging.getLogger("face_blockchain_pipeline")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter(
    '[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s'
)
handler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(handler)

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        run_id = str(uuid.uuid4())
        request.state.run_id = run_id
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            
            logger.info(
                f"[run={run_id}][stage=API_REQUEST] method={request.method} "
                f"path={request.url.path} status={response.status_code} "
                f"duration={process_time:.2f}ms"
            )
            
            response.headers["X-Run-ID"] = run_id
            return response
            
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"[run={run_id}][stage=API_REQUEST] method={request.method} "
                f"path={request.url.path} error=\"{str(e)}\" "
                f"duration={process_time:.2f}ms"
            )
            raise

def get_current_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
