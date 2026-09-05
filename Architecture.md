# Architecture — Face-to-Web Discovery & Blockchain Verification

**Version:** 1.0  
**Purpose:** Single source of truth for implementation architecture.

---

## 1. Architecture Principles

1. Separate face processing, search, evidence, hashing, blockchain, and API orchestration.
2. Never mix provider-specific logic into business logic.
3. Every external dependency must have an adapter/interface.
4. External services are unreliable: every call requires timeout, retry policy, and explicit failure handling.
5. Never fake unavailable results.
6. Never expose secrets to the browser.
7. Blockchain stores fingerprints, not biometric or raw social content.
8. The verification path must independently recalculate the hash.
9. All important operations receive a `run_id`.
10. Any future developer/AI must be able to resume from `Memory.md` without guessing.

---

## 2. Recommended Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Optional lightweight component library
- Browser `fetch`

### Backend
- Python 3.11+
- FastAPI
- Pydantic v2
- Uvicorn
- httpx

### Computer Vision
- InsightFace
- ONNX Runtime
- OpenCV
- Pillow

### Search
Use an adapter around the selected legitimate search provider.

The exact provider must be selected based on:
- face-search/reverse-image capabilities
- API availability
- permitted usage
- result URL availability
- rate limits
- cost
- reliability

Do not hardcode provider-specific behavior into the rest of the system.

### Blockchain
- Solidity
- Hardhat for contract development
- Ethereum Sepolia testnet
- web3.py
- JSON-RPC provider

### Storage
Initial:
- SQLite

Production:
- PostgreSQL

Optional object storage:
- Only if evidence images need temporary/persistent storage and the use is permitted.

---

## 3. High-Level Flow

```text
Browser
  │
  │ POST /api/pipeline/run
  ▼
FastAPI API
  │
  ▼
Pipeline Orchestrator
  ├── FaceService
  │     ├── decode
  │     ├── detect
  │     └── embed
  │
  ├── SearchService
  │     └── SearchProviderAdapter
  │
  ├── CandidateMatcher
  │
  ├── EvidenceService
  │     ├── fetch
  │     ├── normalize
  │     └── canonicalize
  │
  ├── HashService
  │     └── SHA-256
  │
  ├── BlockchainService
  │     └── Web3 / Smart Contract
  │
  └── VerificationService
        ├── refetch
        ├── rehash
        └── compare
```

---

## 4. Suggested Repository Structure

```text
project-root/
├── README.md
├── PRD.md
├── Architecture.md
├── Rules.md
├── Phases.md
├── Design.md
├── Memory.md                 # created when coding starts
├── .env.example
├── .gitignore
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   │
│   │   ├── api/
│   │   │   ├── routes_health.py
│   │   │   ├── routes_pipeline.py
│   │   │   ├── routes_search.py
│   │   │   ├── routes_blockchain.py
│   │   │   └── routes_verification.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── pipeline.py
│   │   │   ├── search.py
│   │   │   ├── evidence.py
│   │   │   └── blockchain.py
│   │   │
│   │   ├── services/
│   │   │   ├── pipeline_service.py
│   │   │   ├── face_service.py
│   │   │   ├── search_service.py
│   │   │   ├── candidate_matcher.py
│   │   │   ├── evidence_service.py
│   │   │   ├── canonicalizer.py
│   │   │   ├── hash_service.py
│   │   │   ├── blockchain_service.py
│   │   │   └── verification_service.py
│   │   │
│   │   ├── providers/
│   │   │   ├── base.py
│   │   │   └── reverse_search_provider.py
│   │   │
│   │   ├── db/
│   │   │   ├── models.py
│   │   │   ├── session.py
│   │   │   └── repositories.py
│   │   │
│   │   └── utils/
│   │       ├── logging.py
│   │       ├── image.py
│   │       └── security.py
│   │
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── requirements.txt
│   └── Dockerfile
│
├── contracts/
│   ├── contracts/
│   │   └── ContentRegistry.sol
│   ├── scripts/
│   ├── test/
│   ├── hardhat.config.ts
│   └── package.json
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── package.json
│
└── docs/
    ├── API.md
    ├── blockchain.md
    └── provider.md
```

---

## 5. Data Model

### PipelineRun

```text
id
created_at
completed_at
status
error_code
software_version
```

### FaceResult

```text
run_id
face_count
selected_face
model_name
model_version
embedding_generated
```

Do not persist the embedding unless required.

### SearchRun

```text
run_id
provider
provider_request_id
started_at
completed_at
status
result_count
```

### SearchCandidate

```text
run_id
url
title
provider_score
candidate_rank
match_status
```

### EvidenceRecord

```text
run_id
source_url
canonical_url
content_type
text
image_sha256
evidence_hash
canonicalization_version
retrieved_at
```

### BlockchainRecord

```text
run_id
chain_id
network
contract_address
evidence_hash
transaction_hash
block_number
status
recorded_at
```

---

## 6. API Contract

### POST `/api/pipeline/run`

Input:
- multipart image
- optional face index
- optional search configuration

Response:

```json
{
  "run_id": "uuid",
  "status": "COMPLETED",
  "face": {},
  "search": {},
  "match": {},
  "evidence": {},
  "blockchain": {},
  "verification": {}
}
```

### GET `/api/pipeline/{run_id}`

Returns the current state.

### POST `/api/search`

Runs only the search stage for debugging.

### POST `/api/blockchain/register`

Registers an already-created evidence hash.

### POST `/api/blockchain/verify`

Reads the chain and compares the supplied hash.

### GET `/api/health`

Must not expose secrets.

---

## 7. Pipeline State Machine

```text
RECEIVED
  ↓
VALIDATING_IMAGE
  ↓
FACE_DETECTION
  ↓
FACE_ENCODING
  ↓
SEARCHING
  ↓
CANDIDATES_FOUND
  ↓
MATCH_EVALUATION
  ↓
EVIDENCE_RETRIEVAL
  ↓
CANONICALIZATION
  ↓
HASHING
  ↓
BLOCKCHAIN_SUBMISSION
  ↓
BLOCKCHAIN_CONFIRMATION
  ↓
VERIFICATION
  ↓
COMPLETED
```

Failure states:

```text
FACE_NOT_FOUND
INVALID_IMAGE
SEARCH_FAILED
NO_MATCH
EVIDENCE_RETRIEVAL_FAILED
HASHING_FAILED
BLOCKCHAIN_FAILED
VERIFICATION_FAILED
```

Never convert a failure state to `COMPLETED`.

---

## 8. Search Adapter

Define an interface conceptually equivalent to:

```python
class SearchProvider:
    async def search(self, image_bytes: bytes) -> SearchResponse:
        ...
```

Provider response should be normalized into internal models.

This allows replacing Provider A with Provider B without changing:
- API routes
- pipeline orchestration
- hashing
- blockchain code
- frontend

---

## 9. Canonicalization Algorithm

The canonicalization version must be explicit.

Recommended rules:

1. Create an internal dictionary with fixed field names.
2. Normalize text using Unicode NFC.
3. Normalize line endings to `\n`.
4. Trim leading/trailing whitespace.
5. Do not arbitrarily lowercase content unless the project explicitly defines case-insensitive semantics.
6. Sort JSON object keys.
7. Serialize using UTF-8.
8. Use compact JSON separators.
9. Encode image bytes independently using SHA-256.
10. Combine stable fields into the evidence object.
11. Hash the final canonical byte sequence.

Example conceptual implementation:

```python
payload = {
    "schema_version": "1.0",
    "source_url": normalized_url,
    "title": normalize_text(title),
    "text": normalize_text(text),
    "image_sha256": image_hash,
}

canonical = json.dumps(
    payload,
    ensure_ascii=False,
    sort_keys=True,
    separators=(",", ":"),
).encode("utf-8")

evidence_hash = hashlib.sha256(canonical).hexdigest()
```

Do not include retrieval timestamps in the stable content hash.

---

## 10. Blockchain Contract Design

Minimal contract:

```solidity
struct Record {
    bytes32 evidenceHash;
    uint256 recordedAt;
    address submitter;
}
```

Mapping:

```solidity
mapping(bytes32 => Record) public records;
```

Functions:

```text
registerContent(bytes32 hash)
verifyContent(bytes32 hash)
getRecord(bytes32 hash)
```

Emit an event:

```text
ContentRegistered(hash, timestamp, submitter)
```

The contract should be intentionally small.

---

## 11. Blockchain Transaction Flow

```text
Backend
 ↓
Connect RPC
 ↓
Validate chain ID
 ↓
Load contract ABI/address
 ↓
Build transaction
 ↓
Estimate gas
 ↓
Sign using server-side private key
 ↓
Send transaction
 ↓
Wait for receipt
 ↓
Check receipt status
 ↓
Persist tx hash + block
```

Never expose the private key to frontend JavaScript.

---

## 12. Verification Flow

Verification must NOT simply trust the previous database value.

```text
Source
 ↓
Fresh retrieval
 ↓
Fresh canonicalization
 ↓
Fresh SHA-256
 ↓
Read on-chain record
 ↓
Compare
```

Database is auxiliary metadata. Blockchain is the authority for the registered fingerprint.

---

## 13. Error Taxonomy

Use stable machine-readable codes:

```text
INVALID_IMAGE
IMAGE_TOO_LARGE
NO_FACE
MULTIPLE_FACES
SEARCH_AUTH_ERROR
SEARCH_RATE_LIMITED
SEARCH_TIMEOUT
SEARCH_PROVIDER_ERROR
NO_SEARCH_RESULTS
NO_CONFIDENT_MATCH
SOURCE_UNAVAILABLE
SOURCE_BLOCKED
CANONICALIZATION_ERROR
BLOCKCHAIN_RPC_ERROR
BLOCKCHAIN_TRANSACTION_REJECTED
BLOCKCHAIN_CONFIRMATION_TIMEOUT
HASH_MISMATCH
```

Frontend should map these to human-readable messages.

---

## 14. Deployment Architecture

```text
Browser
  ↓ HTTPS
Vercel / frontend host
  ↓ HTTPS
Render / backend host
  ├── Search provider API
  ├── PostgreSQL
  └── Ethereum Sepolia RPC
```

Environment variables:

```text
SEARCH_API_KEY=
SEARCH_API_BASE_URL=
RPC_URL=
CHAIN_ID=
CONTRACT_ADDRESS=
DEPLOYER_PRIVATE_KEY=
DATABASE_URL=
CORS_ORIGINS=
MAX_UPLOAD_MB=
```

Never commit `.env`.

---

## 15. Observability

Every request should include:
- `run_id`
- stage
- duration
- success/failure
- error code

Do not log:
- private keys
- API keys
- raw face embeddings
- unnecessary personal information

Example:

```text
[run=abc123][stage=FACE_DETECTION] success duration=82ms
[run=abc123][stage=SEARCH] success results=8 duration=2100ms
[run=abc123][stage=HASH] success hash=9f86...
[run=abc123][stage=BLOCKCHAIN] confirmed tx=0x...
```

---

## 16. Performance Targets

The external search and blockchain confirmation make a strict end-to-end sub-200ms target unrealistic.

Optimize internally:
- image preprocessing
- face detection
- embedding
- local hashing
- database operations

Measure:
- face processing latency
- search latency
- evidence retrieval latency
- hashing latency
- blockchain submission latency
- blockchain confirmation latency
- total latency

Never fabricate latency metrics.
