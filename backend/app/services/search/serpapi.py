import io
import httpx
from typing import List
from PIL import Image
from app.schemas.search import SearchCandidate
from app.services.search.base import BaseSearchProvider, SearchProviderException
from app.config import settings

class SerpApiSearchProvider(BaseSearchProvider):
    @property
    def provider_name(self) -> str:
        return "SERPAPI_LENS"

    def _compress_image(self, image_bytes: bytes, max_size_kb: int = 400) -> bytes:
        """Compress image to be under max_size_kb (SerpApi limit is 500kb)."""
        if len(image_bytes) <= max_size_kb * 1024:
            return image_bytes
            
        try:
            img = Image.open(io.BytesIO(image_bytes))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            quality = 85
            output = io.BytesIO()
            img.save(output, format="JPEG", quality=quality)
            
            while output.tell() > max_size_kb * 1024 and quality > 10:
                quality -= 10
                output = io.BytesIO()
                img.save(output, format="JPEG", quality=quality)
                
            return output.getvalue()
        except Exception as e:
            raise SearchProviderException("IMAGE_COMPRESSION_FAILED", str(e))

    async def search(self, image_bytes: bytes) -> List[SearchCandidate]:
        if not settings.serpapi_api_key:
            raise SearchProviderException("AUTH_ERROR", "SERPAPI_API_KEY is not configured.")

        # Compress if needed
        compressed_bytes = self._compress_image(image_bytes)

        async with httpx.AsyncClient(timeout=30.0) as client:
            # 1. Upload to SerpApi to get image_id
            upload_url = "https://serpapi.com/image"
            files = {'image': ('upload.jpg', compressed_bytes, 'image/jpeg')}
            data = {'api_key': settings.serpapi_api_key}
            
            try:
                upload_resp = await client.post(upload_url, files=files, data=data)
                upload_resp.raise_for_status()
                upload_data = upload_resp.json()
                image_id = upload_data.get("image_id")
                if not image_id:
                    raise ValueError("No image_id returned from SerpApi")
            except Exception as e:
                raise SearchProviderException("UPLOAD_FAILED", f"Failed to upload image to SerpApi: {str(e)}")

            # 2. Query Google Lens
            lens_url = "https://serpapi.com/search"
            params = {
                "engine": "google_lens",
                "image_id": image_id,
                "api_key": settings.serpapi_api_key,
                "hl": "en"
            }
            
            try:
                lens_resp = await client.get(lens_url, params=params)
                lens_resp.raise_for_status()
                lens_data = lens_resp.json()
            except Exception as e:
                raise SearchProviderException("SEARCH_FAILED", f"Google Lens search failed: {str(e)}")

        # Parse visual matches
        candidates: List[SearchCandidate] = []
        visual_matches = lens_data.get("visual_matches", [])
        
        for i, match in enumerate(visual_matches):
            url = match.get("link")
            title = match.get("title", "")
            source = match.get("source", "Unknown Source")
            thumbnail = match.get("thumbnail")
            
            if not url:
                continue
                
            candidates.append(SearchCandidate(
                url=url,
                title=title,
                thumbnail=thumbnail,
                source=source,
                confidence=1.0 - (i * 0.05), # Artificial confidence based on rank
                provider_result_id=f"serpapi-{i}",
                rank=i + 1,
                metadata={"engine": "serpapi_google_lens"}
            ))
            
        return candidates
