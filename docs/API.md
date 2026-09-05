# Pipeline API Reference

## Base URL
`http://<host>:8000/api`

## Endpoints

### `POST /pipeline/run`
Executes the full extraction and blockchain anchoring pipeline.

**Headers:**
- `Content-Type: multipart/form-data`

**Body:**
- `image`: Binary image file (JPEG, PNG, WEBP). Max size 10MB.

**Response:**
Returns a streamed `application/x-ndjson` (Newline Delimited JSON). Each chunk represents a discrete state machine update.

```json
{"status": "VALIDATING_IMAGE", "current_stage": 1, "stages": 14, "data": null}
{"status": "FACE_DETECTION", "current_stage": 2, "stages": 14, "data": null}
// ...
{"status": "COMPLETED", "current_stage": 14, "stages": 14, "data": {"run_id": "...", "transaction_hash": "0x..."}}
```

**Failure States:**
If an error occurs, the stream halts with a failure JSON chunk (e.g., `"status": "NO_FACE"`).

### `POST /blockchain/verify`
Independently retrieves and verifies public content against the blockchain.

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "source_url": "https://example.com/article",
  "expected_hash": "a64d15be...",
  "original_tx_hash": "0x7a84..."
}
```

**Response:**
```json
{
  "status": "VERIFIED",
  "verified": true,
  "tampered": false,
  "local_hash": "a64d15be...",
  "on_chain_hash": "a64d15be...",
  "transaction_hash": "0x7a84..."
}
```

### `GET /health`
Returns the status of the backend API and Search Provider configurations.
