import asyncio
from typing import List
from app.schemas.search import SearchCandidate
from app.services.search.base import BaseSearchProvider, SearchProviderException
from app.config import settings

class MockSearchProvider(BaseSearchProvider):
    @property
    def provider_name(self) -> str:
        return "MOCK_SEARCH"
        
    async def search(self, image_bytes: bytes) -> List[SearchCandidate]:
        if settings.environment == "production":
            raise SearchProviderException(
                "SEARCH_PROVIDER_ERROR", 
                "Mock provider cannot be used in production environment."
            )
            
        # Simulate network latency
        await asyncio.sleep(1.0)
        
        # In a real mock, we could use the byte size to deterministically 
        # return NO_SEARCH_RESULTS for specific test fixtures
        if len(image_bytes) < 100:
            return []
            
        return [
            SearchCandidate(
                url="https://www.instagram.com/p/mock_post_123/",
                title="Jane Doe - Instagram",
                thumbnail="https://instagram.com/favicon.ico",
                source="Instagram",
                confidence=0.98,
                provider_result_id="mock-ig-123",
                rank=1,
                metadata={"mocked": True}
            ),
            SearchCandidate(
                url="https://x.com/janedoe/status/mock_post_456",
                title="Jane Doe (@janedoe) on X",
                thumbnail="https://x.com/favicon.ico",
                source="X (Twitter)",
                confidence=0.95,
                provider_result_id="mock-x-123",
                rank=2,
                metadata={"mocked": True}
            ),
            SearchCandidate(
                url="https://www.linkedin.com/in/mock_post_789/",
                title="Jane Doe | LinkedIn",
                thumbnail="https://linkedin.com/favicon.ico",
                source="LinkedIn",
                confidence=0.91,
                provider_result_id="mock-li-123",
                rank=3,
                metadata={"mocked": True}
            )
        ]
