import httpx
from typing import List
from app.schemas.search import SearchCandidate
from app.services.search.base import BaseSearchProvider, SearchProviderException
import json

class BingVisualSearchProvider(BaseSearchProvider):
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        # Default Bing Visual Search endpoint if not fully specified
        self.base_url = base_url if base_url else "https://api.bing.microsoft.com/v7.0/images/visualsearch"
        timeout = httpx.Timeout(10.0, connect=5.0, read=15.0)
        self.client = httpx.AsyncClient(timeout=timeout)
    
    @property
    def provider_name(self) -> str:
        return "BING_VISUAL_SEARCH"
        
    async def search(self, image_bytes: bytes) -> List[SearchCandidate]:
        if not self.api_key or self.api_key == "your_search_api_key_here":
            raise SearchProviderException("SEARCH_AUTH_ERROR", "Bing API key is missing or invalid.")
            
        headers = {
            "Ocp-Apim-Subscription-Key": self.api_key
        }
        
        # We need a proper multipart boundary for Bing. 
        # For httpx, files={'image': ('image.jpg', image_bytes, 'image/jpeg')} works fine.
        files = {
            "image": ("search_image.jpg", image_bytes, "image/jpeg")
        }
        
        try:
            response = await self.client.post(self.base_url, headers=headers, files=files)
                
            if response.status_code == 401:
                raise SearchProviderException("SEARCH_AUTH_ERROR", "Authentication failed with search provider.")
            elif response.status_code == 429:
                raise SearchProviderException("SEARCH_RATE_LIMITED", "Search provider rate limit exceeded.")
            elif response.status_code != 200:
                raise SearchProviderException("SEARCH_PROVIDER_ERROR", f"Provider returned {response.status_code}")
                    
            data = response.json()
            return self._parse_bing_response(data)
                
        except httpx.TimeoutException:
            raise SearchProviderException("SEARCH_TIMEOUT", "Search provider request timed out.")
        except httpx.RequestError as e:
            raise SearchProviderException("SEARCH_PROVIDER_ERROR", f"Failed to reach search provider: {str(e)}")
            
    def _parse_bing_response(self, data: dict) -> List[SearchCandidate]:
        candidates = []
        tags = data.get("tags", [])
        
        TARGET_DOMAINS = ["instagram.com", "twitter.com", "x.com", "linkedin.com", "facebook.com"]
        
        # Extract pages including this image
        for tag in tags:
            for action in tag.get("actions", []):
                if action.get("actionType") == "PagesIncluding":
                    items = action.get("data", {}).get("value", [])
                    for i, item in enumerate(items):
                        host = item.get("hostPageUrl", "")
                        if not host:
                            continue
                            
                        # Filter for target social media platforms
                        is_target_domain = any(domain in host.lower() for domain in TARGET_DOMAINS)
                        if not is_target_domain:
                            continue
                            
                        candidate = SearchCandidate(
                            url=host,
                            title=item.get("name", "Unknown Title"),
                            thumbnail=item.get("thumbnailUrl"),
                            source=item.get("hostPageDomainFriendlyName", "Unknown Source"),
                            confidence=None, # Bing doesn't explicitly return confidence for PagesIncluding
                            provider_result_id=item.get("imageId"),
                            rank=len(candidates) + 1,
                            metadata={"encodingFormat": item.get("encodingFormat")}
                        )
                        candidates.append(candidate)
                        
        return candidates
