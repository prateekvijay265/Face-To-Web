import base64
import httpx
from typing import List
from app.schemas.search import SearchCandidate
from app.services.search.base import BaseSearchProvider, SearchProviderException
from app.config import settings

class GoogleVisionSearchProvider(BaseSearchProvider):
    @property
    def provider_name(self) -> str:
        return "GOOGLE_VISION"

    async def search(self, image_bytes: bytes) -> List[SearchCandidate]:
        if not settings.google_vision_api_key:
            raise SearchProviderException("AUTH_ERROR", "GOOGLE_VISION_API_KEY is not configured.")

        b64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        payload = {
            "requests": [
                {
                    "image": {
                        "content": b64_image
                    },
                    "features": [
                        {
                            "type": "WEB_DETECTION",
                            "maxResults": 20
                        }
                    ]
                }
            ]
        }

        url = f"https://vision.googleapis.com/v1/images:annotate?key={settings.google_vision_api_key}"

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                resp = await client.post(url, json=payload)
                resp.raise_for_status()
                data = resp.json()
            except Exception as e:
                raise SearchProviderException("SEARCH_FAILED", f"Google Vision API request failed: {str(e)}")

        candidates: List[SearchCandidate] = []
        
        # Parse responses
        responses = data.get("responses", [])
        if not responses:
            return candidates
            
        web_detection = responses[0].get("webDetection", {})
        
        # We can extract from pagesWithMatchingImages
        pages = web_detection.get("pagesWithMatchingImages", [])
        
        for i, page in enumerate(pages):
            page_url = page.get("url")
            page_title = page.get("pageTitle", "Unknown Title")
            
            if not page_url:
                continue
                
            candidates.append(SearchCandidate(
                url=page_url,
                title=page_title,
                thumbnail=None,
                source="Google Vision Web",
                confidence=1.0 - (i * 0.05), # Artificial rank score
                provider_result_id=f"gvision-{i}",
                rank=i + 1,
                metadata={"engine": "google_vision"}
            ))
            
        return candidates
