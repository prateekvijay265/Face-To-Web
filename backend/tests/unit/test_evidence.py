import pytest
import httpx
from unittest.mock import patch
from app.services.evidence_service import evidence_service, EvidenceRetrievalError

def test_is_safe_url():
    assert evidence_service._is_safe_url("https://example.com") is True
    assert evidence_service._is_safe_url("http://example.com") is True
    assert evidence_service._is_safe_url("ftp://example.com") is False
    assert evidence_service._is_safe_url("file:///etc/passwd") is False
    assert evidence_service._is_safe_url("javascript:alert(1)") is False
    assert evidence_service._is_safe_url("https://localhost/api") is False
    assert evidence_service._is_safe_url("http://127.0.0.1") is False
    assert evidence_service._is_safe_url("http://192.168.1.1") is False

def test_canonicalize_url():
    url = "https://Example.com/path?utm_source=twitter&b=2&a=1"
    canon = evidence_service.canonicalize_url(url)
    assert canon == "https://example.com/path?a=1&b=2"
    
    url2 = "http://EXAMPLE.COM?utm_campaign=sale"
    canon2 = evidence_service.canonicalize_url(url2)
    assert canon2 == "http://example.com"

@pytest.mark.asyncio
async def test_retrieve_evidence_unsafe_url():
    with pytest.raises(EvidenceRetrievalError) as exc:
        await evidence_service.retrieve_evidence("file:///etc/passwd")
    assert exc.value.code == "INVALID_URL"

@pytest.mark.asyncio
async def test_retrieve_evidence_timeout():
    with patch("httpx.AsyncClient.stream", side_effect=httpx.TimeoutException("timeout")):
        with pytest.raises(EvidenceRetrievalError) as exc:
            await evidence_service.retrieve_evidence("https://example.com")
        assert exc.value.code == "RETRIEVAL_FAILED"
        
@pytest.mark.asyncio
async def test_retrieve_evidence_oversized():
    # Mock stream response
    class MockResponse:
        status_code = 200
        headers = {"content-type": "text/html", "content-length": str(20 * 1024 * 1024)}
        
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        
    class MockStream:
        def __init__(self, *args, **kwargs): pass
        async def __aenter__(self): return MockResponse()
        async def __aexit__(self, *args): pass
        
    with patch("httpx.AsyncClient.stream", new=MockStream):
        with pytest.raises(EvidenceRetrievalError) as exc:
            await evidence_service.retrieve_evidence("https://example.com")
        assert exc.value.code == "RETRIEVAL_FAILED"
        assert "exceeds maximum allowed size" in exc.value.message

@pytest.mark.asyncio
async def test_retrieve_evidence_unsupported():
    class MockResponse:
        status_code = 200
        headers = {"content-type": "application/pdf"}
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        
    class MockStream:
        def __init__(self, *args, **kwargs): pass
        async def __aenter__(self): return MockResponse()
        async def __aexit__(self, *args): pass
        
    with patch("httpx.AsyncClient.stream", new=MockStream):
        with pytest.raises(EvidenceRetrievalError) as exc:
            await evidence_service.retrieve_evidence("https://example.com/doc.pdf")
        assert exc.value.code == "UNSUPPORTED_CONTENT"

@pytest.mark.asyncio
async def test_retrieve_evidence_valid_html():
    class MockResponse:
        status_code = 200
        headers = {"content-type": "text/html; charset=utf-8"}
        async def __aenter__(self): return self
        async def __aexit__(self, *args): pass
        async def aiter_bytes(self):
            yield b"<html><head><title>Test</title></head><body><script>alert(1)</script><p>Hello \n World</p></body></html>"
            
    class MockStream:
        def __init__(self, *args, **kwargs): pass
        async def __aenter__(self): return MockResponse()
        async def __aexit__(self, *args): pass
        
    with patch("httpx.AsyncClient.stream", new=MockStream):
        record = await evidence_service.retrieve_evidence("https://example.com")
        assert record.title == "Test"
        assert record.text_content == "Test\nHello\nWorld"
        assert record.content_type == "text/html"
