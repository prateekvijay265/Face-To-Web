import os
import json
from web3 import Web3
from web3.exceptions import ContractLogicError, TransactionNotFound, TimeExhausted
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../../../.env"))

class BlockchainResponse(BaseModel):
    network: str
    chain_id: int
    contract_address: str
    evidence_hash: str
    transaction_hash: Optional[str]
    block_number: Optional[int]
    timestamp: Optional[int]
    status: str

class BlockchainError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(self.message)

ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"},
            {"internalType": "string", "name": "schemaVersion", "type": "string"}
        ],
        "name": "registerContent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"}],
        "name": "verifyContent",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "bytes32", "name": "evidenceHash", "type": "bytes32"}],
        "name": "getRecord",
        "outputs": [
            {"internalType": "uint256", "name": "recordedAt", "type": "uint256"},
            {"internalType": "address", "name": "submitter", "type": "address"},
            {"internalType": "string", "name": "schemaVersion", "type": "string"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

class BlockchainService:
    def __init__(self):
        self.rpc_url = os.getenv("RPC_URL")
        self.chain_id = int(os.getenv("CHAIN_ID", 11155111))
        self.contract_address = os.getenv("CONTRACT_ADDRESS")
        self.private_key = os.getenv("DEPLOYER_PRIVATE_KEY")
        
        if not self.rpc_url or not self.contract_address or not self.private_key:
            raise BlockchainError("BLOCKCHAIN_CONFIG_ERROR", "Missing essential blockchain configuration.")

        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if not self.w3.is_connected():
                raise BlockchainError("BLOCKCHAIN_RPC_ERROR", "Failed to connect to the RPC URL.")
        except Exception as e:
            raise BlockchainError("BLOCKCHAIN_RPC_ERROR", str(e))

        actual_chain_id = self.w3.eth.chain_id
        if actual_chain_id != self.chain_id:
            raise BlockchainError(
                "BLOCKCHAIN_CHAIN_MISMATCH", 
                f"Expected chain {self.chain_id} but connected to {actual_chain_id}"
            )
            
        try:
            self.contract_address = self.w3.to_checksum_address(self.contract_address)
        except ValueError:
            raise BlockchainError("BLOCKCHAIN_CONFIG_ERROR", "Invalid contract address format.")
            
        self.contract = self.w3.eth.contract(address=self.contract_address, abi=ABI)
        self.account = self.w3.eth.account.from_key(self.private_key)

    def register_evidence(self, evidence_hash: str, schema_version: str) -> BlockchainResponse:
        try:
            # Hash string to bytes32 format mapping
            hash_bytes = Web3.to_bytes(hexstr=evidence_hash)
            if len(hash_bytes) != 32:
                raise ValueError("evidence_hash must be a 32-byte hex string.")
                
            # 1. Idempotency Check
            is_verified = self.contract.functions.verifyContent(hash_bytes).call()
            if is_verified:
                # Already registered, return existing metadata
                record = self.contract.functions.getRecord(hash_bytes).call()
                return BlockchainResponse(
                    network="sepolia" if self.chain_id == 11155111 else "local",
                    chain_id=self.chain_id,
                    contract_address=self.contract_address,
                    evidence_hash=evidence_hash,
                    transaction_hash=None, # Existed prior
                    block_number=None, # Could fetch block of timestamp if indexed, but omitting
                    timestamp=record[0],
                    status="ALREADY_REGISTERED"
                )

            # 2. Construct Transaction
            nonce = self.w3.eth.get_transaction_count(self.account.address)
            
            tx = self.contract.functions.registerContent(
                hash_bytes,
                schema_version
            ).build_transaction({
                "chainId": self.chain_id,
                "gas": 200000,  # Safe default, will replace if estimate succeeds
                "maxFeePerGas": self.w3.to_wei("20", "gwei"),
                "maxPriorityFeePerGas": self.w3.to_wei("2", "gwei"),
                "nonce": nonce,
            })
            
            try:
                estimated_gas = self.w3.eth.estimate_gas({
                    "to": self.contract_address,
                    "from": self.account.address,
                    "data": tx["data"]
                })
                tx["gas"] = int(estimated_gas * 1.2) # Add 20% buffer
            except Exception as e:
                # Fallback to default gas limit if estimation fails
                pass
                
            # 3. Sign & Submit
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # 4. Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if receipt.status != 1:
                raise BlockchainError("BLOCKCHAIN_TRANSACTION_REJECTED", "Transaction reverted on chain.")
                
            block = self.w3.eth.get_block(receipt.blockNumber)
            
            return BlockchainResponse(
                network="sepolia" if self.chain_id == 11155111 else "local",
                chain_id=self.chain_id,
                contract_address=self.contract_address,
                evidence_hash=evidence_hash,
                transaction_hash=tx_hash.hex(),
                block_number=receipt.blockNumber,
                timestamp=block.timestamp,
                status="SUCCESS"
            )
            
        except TimeExhausted:
            raise BlockchainError("BLOCKCHAIN_CONFIRMATION_TIMEOUT", "Transaction submitted but timed out waiting for receipt.")
        except ContractLogicError as e:
            raise BlockchainError("BLOCKCHAIN_TRANSACTION_REJECTED", str(e))
        except BlockchainError:
            raise
        except Exception as e:
            raise BlockchainError("BLOCKCHAIN_RPC_ERROR", str(e))

# Ensure singleton instantiation waits until runtime inside FastAPI to prevent module-load crashes if env is missing
blockchain_service = None
def get_blockchain_service():
    global blockchain_service
    if not blockchain_service:
        blockchain_service = BlockchainService()
    return blockchain_service
