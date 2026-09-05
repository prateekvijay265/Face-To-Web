import io
import time
import logging
from typing import Optional, Dict, Any, Tuple
from PIL import Image, ImageOps
import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis

from app.config import settings
from app.schemas.base import ErrorResponse

logger = logging.getLogger("face_blockchain_pipeline")

class FaceProcessingError(Exception):
    def __init__(self, error_code: str, message: str):
        self.error_code = error_code
        self.message = message
        super().__init__(self.message)

class FaceService:
    def __init__(self):
        # Initialize FaceAnalysis model
        self.app = FaceAnalysis(name="buffalo_l", allowed_modules=['detection', 'recognition'])
        # Providers for ONNX Runtime (CPU for robust local dev/CI, or GPU if available)
        self.app.prepare(ctx_id=0, det_size=(640, 640))
        self.model_info = {
            "name": "buffalo_l",
            "version": "1.0", # default insightface package model version
        }

    def validate_and_decode(self, image_bytes: bytes) -> np.ndarray:
        # Check size
        if len(image_bytes) > settings.max_upload_mb * 1024 * 1024:
            raise FaceProcessingError("IMAGE_TOO_LARGE", f"Image exceeds {settings.max_upload_mb}MB limit.")
            
        try:
            # Load with PIL to validate and handle EXIF
            img = Image.open(io.BytesIO(image_bytes))
            # Reject unsupported formats
            if img.format not in ['JPEG', 'PNG', 'WEBP', 'MPO']:
                raise FaceProcessingError("INVALID_IMAGE", f"Unsupported format: {img.format}")
                
            # Handle EXIF orientation safely
            img = ImageOps.exif_transpose(img)
            
            # Convert to RGB (in case of RGBA/P/etc.)
            img = img.convert("RGB")
            
            # Safe resizing if dimensions are too large (limit memory consumption)
            MAX_DIM = 1024
            if img.width > MAX_DIM or img.height > MAX_DIM:
                img.thumbnail((MAX_DIM, MAX_DIM), Image.Resampling.LANCZOS)
                
            # Convert to numpy array (RGB) -> OpenCV uses BGR natively
            img_np = np.array(img)
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            return img_bgr
        except FaceProcessingError:
            raise
        except Exception as e:
            raise FaceProcessingError("INVALID_IMAGE", f"Failed to decode image: {str(e)}")

    def process_face(self, run_id: str, image_bytes: bytes, selected_face_index: Optional[int] = None) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Decode & Validate
        decode_start = time.time()
        img_bgr = self.validate_and_decode(image_bytes)
        decode_duration = (time.time() - decode_start) * 1000

        # 2. Detection
        detect_start = time.time()
        try:
            faces = self.app.get(img_bgr)
        except Exception as e:
            raise FaceProcessingError("FACE_ENCODING_FAILED", f"Model error: {str(e)}")
            
        detect_duration = (time.time() - detect_start) * 1000
        
        face_count = len(faces)
        
        if face_count == 0:
            raise FaceProcessingError("NO_FACE", "No face detected in the image.")
            
        if face_count > 1 and selected_face_index is None:
            raise FaceProcessingError("MULTIPLE_FACES", f"Detected {face_count} faces. Please select a specific face index.")
            
        if selected_face_index is not None:
            if selected_face_index < 0 or selected_face_index >= face_count:
                raise FaceProcessingError("INVALID_FACE_INDEX", f"Selected face index {selected_face_index} is out of bounds (0-{face_count-1}).")
            chosen_face_idx = selected_face_index
        else:
            chosen_face_idx = 0
            
        chosen_face = faces[chosen_face_idx]
        
        # InsightFace automatically computes embedding when calling get()
        embedding = chosen_face.embedding
        if embedding is None:
            raise FaceProcessingError("FACE_ENCODING_FAILED", "Failed to generate embedding for the detected face.")
            
        # Logging durations
        total_duration = (time.time() - start_time) * 1000
        logger.info(
            f"[run={run_id}][stage=FACE] success "
            f"decode={decode_duration:.2f}ms detect_embed={detect_duration:.2f}ms total={total_duration:.2f}ms"
        )
        
        return {
            "detected": True,
            "face_count": face_count,
            "selected_face": chosen_face_idx,
            "embedding_generated": True,
            "model": self.model_info["name"],
            "model_version": self.model_info["version"],
            # Bounding box: [x1, y1, x2, y2] in pixel coords
            "bbox": chosen_face.bbox.tolist() if chosen_face.bbox is not None else None,
            # Image dimensions for relative % calculation on frontend
            "image_width": img_bgr.shape[1],
            "image_height": img_bgr.shape[0],
            # Return embedding only for backend internal use, DO NOT send to frontend API directly
            "_internal_embedding": embedding.tolist()
        }

# Singleton instance to reuse model in memory
face_service = FaceService()
