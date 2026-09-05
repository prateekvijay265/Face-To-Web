from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.api.routes_health import router as health_router
from app.api.routes_pipeline import router as pipeline_router
from app.utils.logging import RequestIDMiddleware, logger

app = FastAPI(
    title="Face-to-Web Discovery & Blockchain Verification",
    version=settings.app_version,
)

# CORS Configuration
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middlewares
app.add_middleware(RequestIDMiddleware)

# Exception Handler for stable API error format
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    run_id = getattr(request.state, "run_id", "unknown")
    logger.error(f"[run={run_id}] Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred.",
            "run_id": run_id
        }
    )

# Routers
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(pipeline_router, prefix="/api", tags=["Pipeline"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=(settings.environment == "development"))
