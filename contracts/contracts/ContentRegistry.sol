// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ContentRegistry
/// @notice A minimal, auditable blockchain registry for evidence fingerprints.
contract ContentRegistry {
    
    struct EvidenceRecord {
        uint256 recordedAt;
        address submitter;
        string schemaVersion;
    }
    
    mapping(bytes32 => EvidenceRecord) private records;
    
    event ContentRegistered(
        bytes32 indexed evidenceHash,
        uint256 recordedAt,
        address indexed submitter
    );
    
    error HashAlreadyRegistered(bytes32 evidenceHash);
    
    /// @notice Registers a new deterministic evidence hash.
    /// @param evidenceHash The SHA-256 fingerprint of the canonical evidence.
    /// @param schemaVersion The version of the canonicalization schema used (e.g. "1.0").
    function registerContent(bytes32 evidenceHash, string calldata schemaVersion) external {
        if (records[evidenceHash].recordedAt != 0) {
            revert HashAlreadyRegistered(evidenceHash);
        }
        
        uint256 currentTime = block.timestamp;
        
        records[evidenceHash] = EvidenceRecord({
            recordedAt: currentTime,
            submitter: msg.sender,
            schemaVersion: schemaVersion
        });
        
        emit ContentRegistered(evidenceHash, currentTime, msg.sender);
    }
    
    /// @notice Verifies if a given evidence hash is already registered on-chain.
    /// @param evidenceHash The SHA-256 fingerprint of the canonical evidence.
    /// @return True if the hash exists in the registry, false otherwise.
    function verifyContent(bytes32 evidenceHash) external view returns (bool) {
        return records[evidenceHash].recordedAt != 0;
    }
    
    /// @notice Retrieves the full record of a registered evidence hash.
    /// @param evidenceHash The SHA-256 fingerprint of the canonical evidence.
    /// @return recordedAt The block timestamp when the hash was registered.
    /// @return submitter The address that registered the hash.
    /// @return schemaVersion The schema version string.
    function getRecord(bytes32 evidenceHash) external view returns (
        uint256 recordedAt,
        address submitter,
        string memory schemaVersion
    ) {
        EvidenceRecord memory record = records[evidenceHash];
        return (record.recordedAt, record.submitter, record.schemaVersion);
    }
}
