# Search Provider Integration

This project abstracts search logic through a `BaseSearchProvider` interface, currently implemented via Microsoft's **Bing Visual Search API v7**.

## Implementation Details

- **File**: `backend/app/services/search/bing.py`
- **Network**: HTTP/2 via connection-pooled `httpx.AsyncClient`
- **Timeouts**: Strictly enforced (10s overall, 5s connect, 15s read/write).

## Production vs Development

By design, if the `.env` variable `ENVIRONMENT=production` is set, the system absolutely requires a valid `SEARCH_API_KEY`. 

If `ENVIRONMENT=development` is set and no key is provided, the system gracefully degrades to a `MockSearchProvider` that sleeps for 1 second and returns a deterministic mock URL (`https://example.com/`) to allow end-to-end testing of the web crawler and blockchain layers without incurring API costs.

## Extending Providers

To add Google Vision or AWS Rekognition, inherit from `BaseSearchProvider` and yield a list of `SearchCandidate` schemas. Plug the new class into `search_service.py:SearchService._get_provider()`.
