import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture
def mock_httpx_post():
    with patch("httpx.AsyncClient.post") as mock_post:
        yield mock_post

def test_search_mock_provider():
    # When using development config and NO API KEY, it falls back to MockSearchProvider.
    # The mock returns mock-123 after 1 sec (or immediately if patched).
    
    # We patch asyncio.sleep to not wait in tests
    with patch("asyncio.sleep", return_value=None):
        response = client.post(
            "/api/search",
            files={"image": ("test.jpg", b"fake_image_bytes_that_are_large_enough_to_pass_mock_check"*10, "image/jpeg")}
        )
        
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "MOCK_SEARCH"
    assert data["results_found"] == 1
    assert data["candidates"][0]["provider_result_id"] == "mock-123"

def test_search_mock_empty():
    with patch("asyncio.sleep", return_value=None):
        # Sending tiny bytes returns empty array in mock
        response = client.post(
            "/api/search",
            files={"image": ("test.jpg", b"tiny", "image/jpeg")}
        )
        
    assert response.status_code == 404
    data = response.json()
    assert data["error_code"] == "NO_SEARCH_RESULTS"

def test_bing_provider_parsing():
    from app.services.search.bing import BingVisualSearchProvider
    provider = BingVisualSearchProvider(api_key="fake", base_url="")
    
    mock_response = {
        "tags": [
            {
                "actions": [
                    {
                        "actionType": "PagesIncluding",
                        "data": {
                            "value": [
                                {
                                    "hostPageUrl": "https://example.com",
                                    "name": "Test Title",
                                    "hostPageDomainFriendlyName": "Example",
                                    "imageId": "12345"
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
    
    candidates = provider._parse_bing_response(mock_response)
    assert len(candidates) == 1
    assert candidates[0].url == "https://example.com"
    assert candidates[0].title == "Test Title"
    assert candidates[0].provider_result_id == "12345"

@pytest.mark.asyncio
async def test_bing_provider_auth_error(mock_httpx_post):
    from app.services.search.bing import BingVisualSearchProvider
    from app.services.search.base import SearchProviderException
    
    class MockResponse:
        status_code = 401
        
    mock_httpx_post.return_value = MockResponse()
    
    provider = BingVisualSearchProvider(api_key="real_key_format", base_url="")
    with pytest.raises(SearchProviderException) as exc:
        await provider.search(b"image")
        
    assert exc.value.code == "SEARCH_AUTH_ERROR"

@pytest.mark.asyncio
async def test_bing_provider_timeout():
    from app.services.search.bing import BingVisualSearchProvider
    from app.services.search.base import SearchProviderException
    import httpx
    
    with patch("httpx.AsyncClient.post", side_effect=httpx.TimeoutException("timeout")):
        provider = BingVisualSearchProvider(api_key="real_key_format", base_url="")
        with pytest.raises(SearchProviderException) as exc:
            await provider.search(b"image")
            
        assert exc.value.code == "SEARCH_TIMEOUT"
