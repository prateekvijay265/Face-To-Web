import logging
from typing import List
from app.schemas.search import SearchCandidate

logger = logging.getLogger("face_blockchain_pipeline")

class CandidateMatcher:
    def __init__(self):
        # Configurable thresholds
        self.exact_image_match_score = 1.0
        self.high_confidence_threshold = 0.8
        self.possible_match_threshold = 0.5
        
    def match(self, candidates: List[SearchCandidate]) -> List[SearchCandidate]:
        """
        Evaluates candidates and assigns match_status and application_score.
        """
        for candidate in candidates:
            # 1. Use provider confidence if available
            if candidate.confidence is not None:
                score = candidate.confidence
            else:
                # 2. Application calculated score
                # For Bing Visual Search "PagesIncluding", the provider indicates an exact/near-exact image match.
                # We give it a high application score.
                score = self.exact_image_match_score
                candidate.application_score = score
                
            # Determine status based on thresholds
            if score >= self.high_confidence_threshold:
                candidate.match_status = "MATCH"
            elif score >= self.possible_match_threshold:
                candidate.match_status = "MATCH_POSSIBLE"
            else:
                candidate.match_status = "NO_MATCH"
                
            logger.info(f"Candidate {candidate.url} evaluated: score={score}, status={candidate.match_status}")
            
        return candidates

candidate_matcher = CandidateMatcher()
