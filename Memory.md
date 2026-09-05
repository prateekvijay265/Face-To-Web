# Memory

## Last Updated
2026-09-02T02:57:00+05:30

## Current Phase
Release Engineering & Final Documentation Complete.

## Implementation Summary
The project is officially complete and heavily optimized. It functions as a complete OSINT and cryptographic pipeline allowing journalists and investigators to trace faces across the web, extract raw HTML evidence, and anchor immutable SHA-256 fingerprints onto the Sepolia Ethereum testnet.
We completely rebuilt the UI with strict Tailwind variables, engineered an exact NDJSON server-stream state machine in FastAPI, and deployed a robust `ContentRegistry` Solidity contract. Security vulnerabilities like DNS-rebinding SSRF and unbounded memory abuse were patched. The backend uses highly efficient connection pooling (HTTP/2) and clamped ONNX tensor processing to achieve sub-second local compute latency.

## Exact Deployment Specs
- **Frontend Target**: Vercel/Next.js (`npm run build` verified via Turbopack).
- **Backend Target**: Render/AWS FastApi (`uvicorn` hardened via `reload=False`).
- **Search Provider**: Bing Visual Search API v7 (Production requires strict non-mock authentication).
- **Contract Address**: `0x3D4eB44c0Da9F5BecE787Cb3CEfF569F6daDfe24`
- **Network**: Ethereum Sepolia Testnet (Chain ID: `11155111`)

## Last Successful End-to-End Test
Executed locally bridging Python, OpenCV, and Web3 to Sepolia.
- **Hash**: `11f06cb6f2ccc929511e891242d79b024fd1a96de9a293e04cf3381ad81cb6f9`
- **Transaction**: `0x7a840c1373a4829ff2b75b0d00a556a78911ee56db9eebc1d9b17687ca019ad1`
- **Block**: `11615201`
- **Verification**: Exact Match (`VERIFIED`).

## Known Limitations
- Pipeline latency is heavily bound by Sepolia block confirmation times (4s - 15s).
- Webpages aggressively guarded by Cloudflare CAPTCHAs will fail evidence extraction (`SOURCE_BLOCKED`).
- Javascript-rendered SPAs are unsupported by the crawler; only static HTML is canonicalized.

## Known Failure Modes
- `SEARCH_AUTH_ERROR`: Missing/Expired Bing API key in Production.
- `BLOCKCHAIN_CONFIRMATION_TIMEOUT`: Sepolia network congestion.
- `MULTIPLE_FACES`: Uploading group photos without implementing the sub-selection flow.

## Exact Commands (Run Locally)
**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Exact Next Steps
- Submit project to hackathon! No engineering blockers remain.
