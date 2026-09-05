import asyncio
import time
import logging
from typing import Dict, Any, List

from app.config import settings
from app.services.search.base import SearchProviderException, BaseSearchProvider
from app.services.search.serpapi import SerpApiSearchProvider
from app.services.search.google_vision import GoogleVisionSearchProvider
from app.services.search.mock import MockSearchProvider
from app.schemas.search import SearchResponse, SearchCandidate
from app.services.matcher_service import candidate_matcher

logger = logging.getLogger("face_blockchain_pipeline")

class SearchService:
    def __init__(self):
        self.serpapi_provider = SerpApiSearchProvider()
        self.google_vision_provider = GoogleVisionSearchProvider()

    def _deduplicate_and_merge(self, candidates: List[SearchCandidate]) -> List[SearchCandidate]:
        """Merge identical URLs and boost their confidence."""
        merged: Dict[str, SearchCandidate] = {}
        
        for c in candidates:
            # Simple URL canonicalization for merging
            canonical = c.url.lower().rstrip('/')
            
            if canonical in merged:
                existing = merged[canonical]
                # Boost confidence if found in both
                new_conf = min(0.99, (existing.confidence or 0.5) + (c.confidence or 0.5) * 0.5)
                existing.confidence = new_conf
                existing.metadata['engines'] = existing.metadata.get('engines', []) + [c.metadata.get('engine', 'unknown')]
            else:
                c.metadata['engines'] = [c.metadata.get('engine', 'unknown')]
                merged[canonical] = c
                
        # Sort by confidence descending and re-rank
        sorted_candidates = sorted(merged.values(), key=lambda x: x.confidence or 0.0, reverse=True)
        for i, c in enumerate(sorted_candidates):
            c.rank = i + 1
            
        return sorted_candidates

    async def _run_provider(self, provider: BaseSearchProvider, image_bytes: bytes, run_id: str) -> List[SearchCandidate]:
        try:
            return await provider.search(image_bytes)
        except Exception as e:
            logger.error(f"[run={run_id}][stage=SEARCH] provider={provider.provider_name} failed: {str(e)}")
            return []

    async def search(self, run_id: str, image_bytes: bytes) -> SearchResponse:
        start_time = time.time()
        
        provider_name = "DUAL_AGGREGATOR"
        results = await asyncio.gather(
            self._run_provider(self.serpapi_provider, image_bytes, run_id),
            self._run_provider(self.google_vision_provider, image_bytes, run_id)
        )
        candidates = results[0] + results[1]
        candidates = self._deduplicate_and_merge(candidates)
            
        try:
            # Apply Candidate Matcher
            candidates = candidate_matcher.match(candidates)
            
            duration = (time.time() - start_time) * 1000
            status = "SUCCESS"
            
            if len(candidates) == 0:
                raise SearchProviderException("NO_SEARCH_RESULTS", "Providers returned no candidates.")
                
            logger.info(
                f"[run={run_id}][stage=SEARCH] success "
                f"provider={provider_name} "
                f"duration={duration:.2f}ms candidates={len(candidates)}"
            )
            
            return SearchResponse(
                run_id=run_id,
                provider=provider_name,
                status=status,
                results_found=len(candidates),
                candidates=candidates
            )
            
        except SearchProviderException as e:
            duration = (time.time() - start_time) * 1000
            logger.error(
                f"[run={run_id}][stage=SEARCH] failed "
                f"provider={provider_name} "
                f"duration={duration:.2f}ms error={e.code}"
            )
            raise

search_service = SearchService()
