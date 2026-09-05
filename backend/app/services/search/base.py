from abc import ABC, abstractmethod
from typing import List
from app.schemas.search import SearchCandidate

class SearchProviderException(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(self.message)

class BaseSearchProvider(ABC):
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass
        
    @abstractmethod
    async def search(self, image_bytes: bytes) -> List[SearchCandidate]:
        """
        Takes raw image bytes, searches the external provider,
        and returns a normalized list of SearchCandidate.
        """
        pass
