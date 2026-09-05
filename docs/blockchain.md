# Blockchain Anchoring

The final step of the OSINT pipeline is cryptographically binding the canonical SHA-256 fingerprint to an immutable ledger.

## Architecture

- **Network**: Ethereum Sepolia Testnet
- **RPC Framework**: Web3.py
- **Smart Contract**: `ContentRegistry.sol`

### Contract Schema
```solidity
contract ContentRegistry {
    // Maps a 32-byte SHA-256 hash to a Unix timestamp
    mapping(bytes32 => Record) public records;

    struct Record {
        uint256 recordedAt;
        address submitter;
        string schemaVersion;
    }

    function registerContent(bytes32 evidenceHash, string memory schemaVersion) public;
    function verifyContent(bytes32 evidenceHash) public view returns (bool);
}
```

## Idempotency Mechanism

Before `BlockchainService` submits a costly gas transaction, it executes a free `view` call (`verifyContent()`). If the hash is already registered, the backend aborts the transaction submission, queries the original block timestamp, and yields an `ALREADY_REGISTERED` success state.

## Verifier

The `VerificationService` is explicitly detached from local caching. 
When a verification is requested:
1. It queries the target website fresh.
2. It strips trackers and dynamically re-hashes the DOM.
3. It compares this fresh local hash against the on-chain hash provided.
4. It throws `HASH_MISMATCH` if the website owner has altered the text, images, or structure.
