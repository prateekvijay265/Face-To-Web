import pytest
from app.services.matcher_service import candidate_matcher
from app.schemas.search import SearchCandidate

def test_candidate_matcher_exact_image():
    # If confidence is missing, BingPagesIncluding gives exact match score
    candidate = SearchCandidate(
        url="https://example.com",
        title="Title",
        source="Source",
        rank=1
    )
    
    results = candidate_matcher.match([candidate])
    assert results[0].application_score == 1.0
    assert results[0].match_status == "MATCH_CONFIRMED"

def test_candidate_matcher_provider_confidence():
    candidate = SearchCandidate(
        url="https://example.com",
        title="Title",
        source="Source",
        rank=1,
        confidence=0.6
    )
    
    results = candidate_matcher.match([candidate])
    assert results[0].confidence == 0.6
    assert results[0].match_status == "MATCH_POSSIBLE"
    assert results[0].application_score is None

def test_candidate_matcher_no_match():
    candidate = SearchCandidate(
        url="https://example.com",
        title="Title",
        source="Source",
        rank=1,
        confidence=0.2
    )
    
    results = candidate_matcher.match([candidate])
    assert results[0].match_status == "NO_MATCH"
