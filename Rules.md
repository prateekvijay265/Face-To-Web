# Rules — AI Coding & Project Execution Rules

**Purpose:** This file is the binding instruction set for any AI coding agent working on this repository.

---

# 1. HIGHEST-PRIORITY RULE

**Do not invent implementation status.**

If something has not been implemented, say:

```text
NOT IMPLEMENTED
```

If something was not tested, say:

```text
NOT TESTED
```

If an external service is unavailable, do not replace it with fake data.

---

# 2. Requirement Fidelity

The project must preserve these three real stages:

```text
1. Face detection/encoding
2. Genuine public-web/social discovery
3. Blockchain registration + re-verification
```

The search stage must be genuinely executed at runtime.

Forbidden:

```python
return [{"url": "https://preselected.example/post"}]
```

Forbidden:
- hardcoded "successful" search result
- fake confidence score
- fake blockchain transaction hash
- fake block number
- fake verification result

A mock provider may exist **only for automated tests**, and it must:
- be explicitly named `MockSearchProvider`
- never be selected in production
- never be used in the demo without an obvious `DEMO_MODE` indicator
- never be confused with the real provider

---

# 3. AI Must Read Project Context First

At the beginning of every coding session:

1. Read `PRD.md`.
2. Read `Architecture.md`.
3. Read `Rules.md`.
4. Read `Phases.md`.
5. If it exists, read `Memory.md`.
6. Inspect the actual repository.
7. Determine the current phase.
8. Check git status.
9. Run existing tests if practical.
10. Only then modify code.

Do not assume previous work survived.

---

# 4. Continuation Rule

If the project has been untouched for hours/days:

Do NOT reconstruct history from memory.

Instead:

```text
PRD.md
Architecture.md
Rules.md
Phases.md
Memory.md
actual source tree
git diff
tests
```

must be treated as the current source of truth.

If `Memory.md` contradicts actual code:
- trust actual code for what exists
- document the contradiction
- update Memory.md

---

# 5. No Scope Creep

Do not add:
- authentication
- payments
- social login
- unrelated AI features
- unnecessary microservices
- Kubernetes
- complex queues
- analytics dashboards
- extra blockchain features

unless a phase explicitly requires them.

---

# 6. Dependency Rules

Prefer mature, documented libraries.

### Python
Allowed/preferred:
- FastAPI
- Pydantic
- httpx
- Pillow
- OpenCV
- InsightFace
- ONNX Runtime
- web3.py
- SQLAlchemy
- pytest

### Frontend
Allowed/preferred:
- Next.js
- TypeScript
- Tailwind CSS

### Blockchain
Allowed/preferred:
- Solidity
- Hardhat
- OpenZeppelin where useful
- web3.py

Do not add a dependency merely to solve a problem that can be solved cleanly with the existing stack.

Before adding a dependency:
1. Explain why.
2. Confirm it is compatible.
3. Add it to the correct lock/requirements file.
4. Test installation.

---

# 7. Search Provider Rules

The selected search provider must be configurable.

Never hardcode:
- API key
- endpoint secret
- account credentials

Use:

```text
SEARCH_API_KEY
SEARCH_API_BASE_URL
```

Search calls must:
- timeout
- handle HTTP errors
- handle rate limiting
- validate JSON
- validate URLs
- normalize provider responses

Do not bypass:
- CAPTCHA
- authentication
- access controls
- paywalls
- platform security
- rate limiting
- robots restrictions

Do not build stealth automation intended to evade anti-bot systems.

---

# 8. Face Processing Rules

- Validate image before processing.
- Handle EXIF orientation.
- Limit image dimensions.
- Limit upload size.
- Never assume one face.
- If multiple faces exist, require deterministic selection.
- Never silently choose a random face.
- Never claim identity from an embedding alone.
- Do not put face embeddings on-chain.
- Minimize storage of biometric data.

Face matching thresholds must be configurable and documented.

Do not invent a threshold merely because it produces better-looking demo results.

---

# 9. Privacy Rules

The system may be demonstrated with:
- the developer's own image
- consenting participants
- test images with appropriate rights

Do not build features intended to:
- identify unknown private people
- track a person across locations
- infer sensitive traits
- access private accounts
- circumvent privacy settings

The application should describe a match as:

```text
"potential/confirmed content match"
```

not:

```text
"legal identity verified"
```

---

# 10. Evidence Rules

Every evidence record must distinguish:

```text
source_url
retrieved_at
stable_content
```

Do not include unstable fields in the content hash unless explicitly required.

Do not hash a random string.

The hash must be reproducible.

---

# 11. Canonicalization Rules

Canonicalization MUST have a version.

Example:

```text
canonicalization_version = "1.0"
```

If the algorithm changes:
- increment version
- document migration implications
- do not silently change existing verification semantics

Canonical JSON:
- UTF-8
- sorted keys
- deterministic separators
- defined Unicode normalization
- defined whitespace behavior
- defined URL normalization

---

# 12. Hashing Rules

Use SHA-256 unless the architecture is intentionally changed.

Correct:

```python
hashlib.sha256(canonical_bytes).hexdigest()
```

Do not:
- use Python's `hash()`
- use timestamps as the sole fingerprint
- hash only a database ID
- use non-deterministic serialization

---

# 13. Blockchain Rules

Never:
- put private keys in source
- put private keys in frontend code
- commit `.env`
- store raw faces on-chain
- store embeddings on-chain
- store unnecessary personal information on-chain

Blockchain transaction success must be based on an actual receipt.

Never return:

```json
{"confirmed": true}
```

unless a real transaction receipt confirms it.

Verify chain ID before sending a transaction.

---

# 14. Verification Rules

Verification must recompute the fingerprint.

Forbidden:

```python
return db_record.status
```

Correct:

```text
retrieve current evidence
→ canonicalize
→ hash
→ read chain
→ compare
```

If current evidence cannot be retrieved, report:

```text
VERIFICATION_UNAVAILABLE
```

Do not report `VERIFIED`.

---

# 15. API Rules

All API responses must be typed.

Use Pydantic models.

Do not expose stack traces in production responses.

Use stable error codes.

Every pipeline request gets a unique `run_id`.

---

# 16. Frontend Rules

Frontend must:
- show actual pipeline status
- distinguish loading from success
- distinguish no match from error
- show blockchain transaction only when available
- show verification only after actual verification
- never fabricate progress

If an external API takes 10 seconds, do not display a fake "2 seconds" metric.

---

# 17. Testing Rules

Minimum tests:

### Unit
- image validation
- canonicalization
- URL normalization
- SHA-256
- blockchain payload generation
- response parsing

### Integration
- complete mocked search flow
- complete blockchain flow against local test chain
- verification success
- verification mismatch

### Manual
At least:
1. Real face input.
2. Real search.
3. Real public result.
4. Real testnet transaction.
5. Re-verification.
6. Tampering test.

---

# 18. Git Rules

Use small commits.

Suggested format:

```text
feat(face): add face detection service
feat(search): add provider adapter
feat(evidence): implement canonical hashing
feat(chain): add content registry
feat(api): add pipeline endpoint
test(chain): add verification tests
fix(search): handle provider timeout
```

Never use:

```text
final
final2
final_final
working
fixed
new
```

as meaningful commit messages.

---

# 19. AI Change Protocol

Before editing:
1. Explain what files will change.
2. Explain why.
3. Check existing implementation.
4. Make the smallest coherent change.

After editing:
1. Run formatter/linter.
2. Run relevant tests.
3. Run build if applicable.
4. Report exact results.
5. Update `Memory.md`.
6. Update `Phases.md` if phase status changed.

---

# 20. Stop Conditions

The AI must STOP and ask the user when:
- a required API key is missing and cannot be safely mocked for development
- the selected search provider is unavailable
- blockchain credentials are missing for live deployment
- requirements conflict
- an irreversible database migration is required
- a security-sensitive decision is ambiguous
- multiple faces exist and selection cannot be determined
- the user requests behavior that bypasses platform protections

Do not guess.

---

# 21. "Do Not Hallucinate" Checklist

Before claiming completion:

```text
[ ] Did I actually inspect the file?
[ ] Did I actually implement the feature?
[ ] Did I run the relevant test?
[ ] Did the test pass?
[ ] Is the external service genuinely called?
[ ] Is the result runtime-generated?
[ ] Is the blockchain transaction real?
[ ] Is verification independently recalculated?
[ ] Did I update Memory.md?
[ ] Did I update Phases.md?
```

If any answer is NO, do not claim the feature is complete.
