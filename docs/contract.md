# Smart Contract Documentation

For Phase 7 (ContentRegistry Smart Contract), a minimal blockchain registry stores the deterministic SHA-256 fingerprint generated during Phase 6. 

## Contract: `ContentRegistry.sol`
**Location:** `contracts/contracts/ContentRegistry.sol`
**Solidity Version:** `^0.8.20` (Compatible with Hardhat configured for `0.8.28`)

## Behavior
The registry uses a `mapping(bytes32 => EvidenceRecord)` to store records and strictly enforces a one-hash, one-record policy to prevent spam or conflicting timestamps. 

1. **`registerContent(bytes32 evidenceHash, string schemaVersion)`**: Takes the 32-byte hash and schema version string. 
    - Verifies it hasn't been registered by checking the timestamp (`recordedAt != 0`). 
    - Reverts with `HashAlreadyRegistered(bytes32)` custom error if a duplicate is found, saving gas over string reverts.
    - Captures `block.timestamp` and `msg.sender` directly from the chain context (trustless).
    - Emits a `ContentRegistered` event containing the hash, timestamp, and submitter address for off-chain indexing.
2. **`verifyContent(bytes32 evidenceHash)`**: A fast `view` function returning a boolean if the hash exists.
3. **`getRecord(bytes32 evidenceHash)`**: Returns the full metadata tuple (`recordedAt`, `submitter`, `schemaVersion`).

## Security & Privacy
The contract explicitly avoids storing PII, embeddings, images, or full social media URLs on chain. It stores exactly 32 bytes representing the cryptographic proof of the canonical object, ensuring full GDPR compliance and minimal gas consumption.

## Compilation and ABI
Compile the contract utilizing:
```bash
npx hardhat compile
```
This generates the Application Binary Interface (ABI) required for FastAPI/Web3 integrations.
**ABI Location:** `contracts/artifacts/contracts/ContentRegistry.sol/ContentRegistry.json`

## Testing
Comprehensive tests covering fresh registrations, duplicate rejections (custom error parsing), missing records, event emission, and stored data verification are provided at `contracts/test/ContentRegistry.js`. Run tests with:
```bash
npx hardhat test
```
