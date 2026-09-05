# Face-to-Web Discovery & Blockchain Verification Pipeline

An end-to-end OSINT and cryptographic pipeline that allows journalists, investigators, and organizations to trace faces across the public web and immutably anchor the extracted evidence onto the Ethereum blockchain.

## Project Overview

This system acts as a "Digital Evidence Workstation." The pipeline performs state-of-the-art facial recognition (via InsightFace ONNX runtime), executes visual web searches (via Bing Visual Search), crawls matched websites for raw HTML/image evidence, generates canonical SHA-256 fingerprints of the content, and anchors the proof onto the Sepolia Ethereum testnet.

A subsequent independent verification engine allows users to cryptographically verify if the public web content has been tampered with since its original on-chain registration.

## Architecture

The project is split into three decoupled tiers:

1.  **Frontend (Next.js 16 + React 19)**: A strictly-typed, responsive UI built with Tailwind CSS. It natively streams Server-Sent NDJSON state updates from the backend to render exact, un-faked pipeline lifecycles.
2.  **Backend (FastAPI 0.115 + Python 3.13)**: The orchestration engine. Handles memory-efficient OpenCV tensor manipulations, asynchronous HTTPX connection-pooled web crawling, deterministic canonicalization, and Web3 transaction signing.
3.  **Blockchain (Ethereum Sepolia + Solidity)**: An immutable `ContentRegistry` smart contract deployed on the Sepolia testnet to act as a permanent timestamped cryptographic ledger.

## Prerequisites

-   **Node.js**: v26+
-   **Python**: 3.13+ (or `uv` package manager)
-   **OpenCV Dependencies**: (e.g., `libgl1` on Linux, natively supported on Windows/macOS)
-   **Ethereum Wallet**: An RPC URL (e.g., Alchemy/Infura) and a wallet private key funded with Sepolia ETH.

## Local Setup

### 1. Environment Variables

We strictly prohibit committing secrets. Create a `.env` file in the root directory (refer to `.env.example`):

```bash
cp .env.example .env
```

You must populate the following:
*   `RPC_URL`: Your Alchemy/Infura HTTPS endpoint for Sepolia.
*   `DEPLOYER_PRIVATE_KEY`: Your Ethereum wallet private key.
*   `SEARCH_API_KEY`: Your Bing Visual Search API Key. (Required for `production`).

### 2. Blockchain Setup & Contract Deployment

```bash
cd blockchain
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```
*Note the deployed contract address and update `CONTRACT_ADDRESS` in your `.env` file.*

### 3. Backend Setup

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
*(The backend will automatically download the required InsightFace ONNX models to `~/.insightface` on first run).*

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

## Demo Procedure (Final User Journey)

1.  **Launch**: Open the application to view the Digital Evidence Workstation dashboard.
2.  **Upload**: Drag and drop a photograph containing a single human face.
3.  **Real-Time Processing**: The UI will stream live backend states. You will see Face Detection initialize and extract a 512-dimensional embedding.
4.  **Search**: The system queries the Bing Visual API to identify matching public content.
5.  **Evidence Extraction**: The pipeline crawls the top candidate URL, parses the DOM, strips dynamic trackers, and standardizes the payload.
6.  **Hashing**: A canonical SHA-256 fingerprint is generated.
7.  **Blockchain Anchoring**: The backend signs a transaction to the Sepolia network. Wait for block confirmation. The UI will display the real Transaction Hash and Block Number.
8.  **Verification**: Click the "Verify" panel to independently crawl the URL again, re-hash it, and compare it against the immutable Sepolia registry to prove non-tampering.

## Search Provider Setup (Bing Visual Search)

To obtain a valid search key:
1. Navigate to the Azure Portal.
2. Provision a "Bing Search v7" resource.
3. Extract the `Key 1` and paste it into `SEARCH_API_KEY`.
*Note: If `ENVIRONMENT=production`, the application will intentionally hard-crash with an HTTP 401 if this key is missing.*

## Testing & Quality Assurance

**Backend Unit Tests (30/30 Pass)**:
```bash
cd backend
pytest tests/
```

**Frontend Build Tests**:
```bash
cd frontend
npm run build
```

## Known Limitations & Failure Modes

*   **Sepolia Block Time**: Pipeline latency is dominated by Ethereum testnet block mining (fluctuating between 4s - 15s). The UI will gracefully spin on `BLOCKCHAIN_SUBMISSION` until a receipt is confirmed.
*   **Search Limitations**: Certain news websites aggressively employ Cloudflare or CAPTCHAs, preventing the Evidence Extractor from parsing the HTML. The pipeline will safely catch this and yield a `SOURCE_BLOCKED` failure mode.
*   **Dynamic Websites**: Single-Page Applications (SPAs) that require Javascript rendering are not currently supported by the `httpx` HTTP parser. Only static HTML DOM is canonicalized.

## Troubleshooting

-   **`SEARCH_AUTH_ERROR`**: Your Bing API key is invalid or exhausted.
-   **`NO_FACE` / `MULTIPLE_FACES`**: The image uploaded violates the strict 1-face rule. Crop the image or use a different source.
-   **`BLOCKCHAIN_CONFIRMATION_TIMEOUT`**: The RPC provider dropped the connection, or Sepolia gas prices spiked.

---
*Developed for advanced verifiable OSINT analysis.*
