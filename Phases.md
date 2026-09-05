# Phases — Incremental Build Plan

**Rule:** Complete one phase at a time. Do not silently jump ahead.

---

# Phase 0 — Project Initialization [COMPLETED]

## Goal
Create a clean repository and development environment.

## Tasks
- Initialize Git.
- Create repository structure.
- Create `.gitignore`.
- Create `.env.example`.
- Add Python environment.
- Add frontend scaffold.
- Add backend scaffold.
- Add contract scaffold.
- Add documentation files.
- Confirm Python/Node versions.

## Exit criteria
```text
Backend starts.
Frontend starts.
Contract project compiles.
Health endpoint works.
Git status is clean except intended changes.
```

## Memory update
Create `Memory.md` after coding begins.

---

# Phase 1 — Backend Foundation [COMPLETED]

## Goal
Create stable FastAPI architecture.

## Tasks
- `main.py`
- configuration
- CORS
- health endpoint
- structured errors
- request IDs/run IDs
- logging
- Pydantic schemas

## Tests
- `/api/health`
- invalid request
- oversized upload
- CORS behavior

## Exit criteria
Backend starts with documented environment variables.

---

# Phase 2 — Face Detection and Encoding [COMPLETED]

## Goal
Implement actual face detection and embedding.

## Tasks
- Install InsightFace/ONNX Runtime.
- Implement image validation.
- Implement decoding.
- Handle EXIF orientation.
- Resize oversized images safely.
- Detect faces.
- Handle zero faces.
- Handle multiple faces.
- Generate embedding.
- Return model metadata.

## Required statuses

```text
NO_FACE
MULTIPLE_FACES
FACE_ENCODED
```

## Tests
- valid image
- invalid image
- no-face image
- multi-face image
- corrupted image

## Exit criteria
A real image produces a real embedding without storing it unnecessarily.

---

# Phase 3 — Search Provider Integration [BLOCKED_ON_CREDENTIALS]

## Goal
Implement genuine runtime web/public-social discovery.

## Tasks
- Select provider.
- Document provider.
- Create adapter interface.
- Add environment variables.
- Implement API request.
- Implement timeout.
- Implement retries.
- Parse provider response.
- Normalize candidate model.
- Preserve provider request ID if available.

## Critical rule
No hardcoded production result.

## Exit criteria
A real API request produces real candidate data. (Currently pending real Bing API credentials to test a full production request).

---

# Phase 4 — Candidate Matching [COMPLETED]

## Goal
Turn search results into explicit match states.

## Tasks
- Normalize URLs.
- Validate candidate objects.
- Rank candidates.
- Define confidence rules.
- Define minimum match threshold.
- Return:
  - `MATCH_CONFIRMED`
  - `MATCH_POSSIBLE`
  - `NO_MATCH`

## Exit criteria
The system can explain why a candidate was selected.

---

# Phase 5 — Evidence Retrieval [COMPLETED]

## Goal
Retrieve the selected public evidence safely.

## Tasks
- HTTP(S)-only validation.
- Timeout.
- response-size limit.
- content-type validation.
- metadata extraction.
- image retrieval where permitted.
- text normalization.
- URL canonicalization.

## Failure states

```text
SOURCE_UNAVAILABLE
SOURCE_BLOCKED
RETRIEVAL_FAILED
UNSUPPORTED_CONTENT
INVALID_URL
```

## Exit criteria
The system creates a stable internal EvidenceRecord.

---

# Phase 6 — Cryptographic Fingerprinting [COMPLETED]

## Goal
Create deterministic evidence fingerprints.

## Tasks
- Define canonical schema v1.0.
- Implement text normalization.
- Implement image SHA-256.
- Implement canonical JSON.
- Implement final evidence SHA-256.
- Persist canonicalization version.

## Tests
The same evidence serialized in different key order must produce the same final hash.

Changing one stable field must change the hash.

## Exit criteria
Hashing is deterministic and thoroughly tested.

---

# Phase 7 — Smart Contract [COMPLETED]

## Goal
Create the blockchain registry.

## Tasks
- Write `ContentRegistry.sol`.
- Add record structure.
- Add registration function.
- Add verification function.
- Add event.
- Add duplicate handling.
- Add unit tests.
- Compile.

## Exit criteria
Contract tests pass.

---

# Phase 8 — Testnet Deployment [COMPLETED]

## Goal
Deploy the contract to a real testnet.

## Tasks
- Configure hardhat.config.js for testnet (e.g., Sepolia).
- Load secrets safely.
- Write deployment script.
- Verify chain ID before deployment.
- Execute deployment.
- Verify reachability.

## Security
Private key must never enter Git.

## Exit criteria
Contract is deployed and callable.

---

# Phase 9 — Blockchain Service [COMPLETED]

## Goal
Connect FastAPI to the deployed contract.

## Tasks
- web3.py setup.
- ABI loading.
- chain ID validation.
- transaction construction.
- wait for receipt.
- parse metadata.
- Idempotency checks.
- Handle frontend updates.

## Exit criteria
Backend can submit transactions and return validated metadata.

---

# Phase 10 — Verification Service [COMPLETED]

## Goal
Implement independent verification.

## Tasks
- Write verification endpoint.
- Retrieve fresh evidence.
- Compare hashes.
- Return explicit status (`VERIFIED`, `HASH_MISMATCH`, etc.).
- Build Verification UI.

## Exit criteria
System can objectively prove or disprove evidence integrity.

## Tests
### Positive
Same evidence → verified.

### Negative
Modified evidence → mismatch.

### Unavailable
Source unreachable → verification unavailable.

---

# Phase 11 — Complete Pipeline Orchestrator [COMPLETED]

## Goal
Implement a cohesive backend state machine to orchestrate the entire end-to-end pipeline in a single API call, replacing frontend-driven manual steps.

## Tasks
- Write `pipeline_service.py`.
- Define rigid sequence (Face -> Search -> Evidence -> Hash -> Blockchain -> Verification).
- Embed failure states (`NO_FACE`, `MULTIPLE_FACES`, `NO_MATCH`, etc.) that halt dependents.
- Map timing and duration profiling per step.
- Wire frontend `PipelineStepper` to strictly transition based on streamed NDJSON backend state.
- Add telemetry and debug rendering for demo mode.

## Exit criteria
User uploads an image, and the frontend accurately animates through a continuous backend execution cycle without manual HTTP interactions until completion or failure.

## Exit criteria
Verification cannot accidentally report success from stale DB state.

---

# Phase 11 — Pipeline Orchestrator

## Goal
Connect all stages.

```text
upload
→ face
→ search
→ match
→ evidence
→ hash
→ blockchain
→ verify
```

## Tasks
- Create `pipeline_service.py`.
- Create state machine.
- Persist stage results.
- Add run ID.
- Add stage timing.
- Add failure propagation.

## Exit criteria
One API call executes the complete pipeline.

---

# Phase 12 — Frontend

## Goal
Create the demonstration interface.

## Screens/sections
1. Upload.
2. Face detection.
3. Search progress.
4. Candidate results.
5. Evidence.
6. Hash.
7. Blockchain transaction.
8. Verification.
9. Error state.

## Exit criteria
A non-technical evaluator can understand the complete flow.

---

# Phase 13 — End-to-End Testing

## Test 1
Consenting public test face.

## Test 2
No public match.

## Test 3
Search provider timeout.

## Test 4
Source retrieval failure.

## Test 5
Blockchain RPC failure.

## Test 6
Hash tampering.

## Test 7
Repeated identical evidence.

## Exit criteria
All expected states work.

---

# Phase 14 — Deployment

## Backend
Deploy FastAPI.

## Frontend
Deploy Next.js.

## Contract
Keep testnet deployment.

## Tasks
- Configure production secrets.
- Configure CORS.
- HTTPS.
- Health check.
- Logging.
- Test production pipeline.

## Exit criteria
Public demo works end-to-end.

---

# Phase 15 — Demo Hardening

## Demo script

```text
1. Upload consenting test photo.
2. Show face detected.
3. Start genuine search.
4. Show runtime result.
5. Show candidate/source.
6. Generate hash.
7. Register hash.
8. Show transaction.
9. Verify.
10. Modify evidence.
11. Verify again.
12. Show HASH_MISMATCH.
```

## Final checklist

```text
[ ] No hardcoded result.
[ ] Real search.
[ ] Real candidate.
[ ] Real hash.
[ ] Real testnet transaction.
[ ] Real on-chain verification.
[ ] Tampering demonstration.
[ ] Error handling.
[ ] README complete.
[ ] Memory.md current.
[ ] Phases.md current.
```

---

# Phase Transition Rule

Never mark a phase complete merely because code exists.

A phase requires:

```text
Implementation
+
Relevant tests
+
Manual validation where required
+
Documentation
+
Memory update
```
