<div align="center">

<!-- Hero Banner using Capsule Render -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=250&section=header&text=Face-To-Web&fontSize=70&fontAlignY=35&desc=AI%20Face%20Detection%20%2B%20Web%20Search%20%2B%20Blockchain%20Anchoring&descAlignY=55&descSize=20&descColor=ffffff" width="100%" />

<!-- Animated Typing Effect -->
<a href="https://github.com/prateekvijay265/Face-To-Web">
  <img src="https://readme-typing-svg.demolab.com?font=Space+Grotesk&weight=700&size=24&pause=1000&color=FF5C00&center=true&vCenter=true&width=600&height=50&lines=Neural+Face+Detection;Reverse+Image+Search;Immutable+Blockchain+Evidence;Built+for+Hacker+House+Goa+2026" alt="Typing SVG" />
</a>

<br/>

<!-- Badges -->
<a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
<a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
<a href="https://github.com/deepinsight/insightface"><img src="https://img.shields.io/badge/InsightFace-Buffalo_L-FF5C00?style=for-the-badge&logo=ai&logoColor=white" alt="InsightFace" /></a>
<a href="https://ethereum.org/"><img src="https://img.shields.io/badge/Ethereum-Sepolia-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" alt="Ethereum" /></a>
<a href="https://hhgoa.com/"><img src="https://img.shields.io/badge/HH_Goa-Task_3-FF0055?style=for-the-badge&logo=hackerone&logoColor=white" alt="HH Goa" /></a>

</div>

<br/>

<img src="https://capsule-render.vercel.app/api?type=rect&color=FF5C00&height=5&section=footer" width="100%" />

## 🌌 What the Project Does

**Face-to-Web** is an advanced, fully automated forensic pipeline built for **Hacker House Goa 2026 (Task 3)**. 

The application solves the problem of verifying digital identities and anchoring evidence securely. It performs the following sequential pipeline:
1. **Face Detection**: Takes a portrait photograph and extracts a 512-dimensional neural facial embedding using the production-grade `buffalo_l` model from InsightFace.
2. **Web Scraping / Search**: Scours the open web in real-time (using Google Vision / SerpAPI) to find exact visually similar matches and extract the source URL.
3. **Blockchain Anchoring**: Generates a deterministic SHA-256 fingerprint of the resulting evidence and anchors it immutably to a smart contract.

> *"Less noise. More signal. Anchor the truth."*

---

## ⛓️ Blockchain Used

This project anchors data to the **Ethereum Sepolia Testnet**. 

We utilized the Sepolia testnet because it perfectly simulates the mainnet environment while allowing for free gas testing via faucets. The smart contract stores the SHA-256 hash of the web evidence, ensuring cryptographic immutability and proving that a specific face was linked to a specific web URL at a specific timestamp.

<img src="https://capsule-render.vercel.app/api?type=rect&color=FF5C00&height=5&section=footer" width="100%" />

## 📐 Architecture & Pipeline

```mermaid
graph TD
    A[Upload Image] -->|Next.js| B(FastAPI Backend)
    B --> C{InsightFace}
    C -->|Extracts 512-dim Vector| D[Face Detected]
    C -->|No Face/Multiple Faces| E[Error]
    
    D --> F{Google Vision / SerpAPI}
    F -->|Reverse Image Search| G[Find Top Match URL & Source]
    
    G --> H{SHA-256 Hashing}
    H -->|Fingerprint| I[Immutable Hash]
    
    I --> J{Web3.py}
    J -->|Transaction| K[(Ethereum Sepolia Contract)]
    
    K --> L[Etherscan Verified Record]
    
    style A fill:#0d0d0d,stroke:#ff5c00,stroke-width:2px,color:#fff
    style B fill:#0d0d0d,stroke:#ff5c00,stroke-width:2px,color:#fff
    style C fill:#1a1a1a,stroke:#484848,stroke-width:1px,color:#fff
    style D fill:#00e57a,stroke:#00e57a,stroke-width:2px,color:#000
    style F fill:#1a1a1a,stroke:#484848,stroke-width:1px,color:#fff
    style G fill:#00cfff,stroke:#00cfff,stroke-width:2px,color:#000
    style H fill:#1a1a1a,stroke:#484848,stroke-width:1px,color:#fff
    style I fill:#ffca28,stroke:#ffca28,stroke-width:2px,color:#000
    style J fill:#1a1a1a,stroke:#484848,stroke-width:1px,color:#fff
    style K fill:#ff5c00,stroke:#ff5c00,stroke-width:2px,color:#fff
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=FF5C00&height=5&section=footer" width="100%" />

## 🚀 How to Run It (Local Development)

Because the AI face detection model requires over 1GB of RAM, the most reliable way to run this project is locally.

### Prerequisites
*   Python 3.11+
*   Node.js 18+
*   C++ Build Tools (Required for InsightFace/OpenCV)
*   API Keys: SerpAPI, Infura/Alchemy (Sepolia), and an Ethereum Wallet Private Key.

### 1️⃣ Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt

# Create your .env file
cp .env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```
*Note: The first run will automatically download the ~300MB `buffalo_l` model.*

### 2️⃣ Frontend Setup (Next.js)

```bash
cd frontend
npm install

# Run the development server
npm run dev
```
Navigate to `http://localhost:3000` to access the workstation.

<img src="https://capsule-render.vercel.app/api?type=rect&color=FF5C00&height=5&section=footer" width="100%" />

## ⚠️ Known Limitations

1. **Hardware / RAM Requirements**: The `buffalo_l` InsightFace model requires a minimum of 1GB to 2GB of RAM to process image encodings. Because of this, it cannot be hosted on standard free-tier cloud providers (like Render or Vercel Serverless) without running out of memory. 
2. **C++ Build Dependencies**: Installing the backend on a fresh machine requires a C++ compiler (`build-essential` on Linux or Visual Studio C++ Build Tools on Windows) for the `insightface` package to compile properly.
3. **Search Engine Dependency**: The reverse image search accuracy relies heavily on Google Lens via SerpAPI. Extremely obscure or low-resolution faces may not return a match if they are not indexed by Google.

<img src="https://capsule-render.vercel.app/api?type=rect&color=FF5C00&height=5&section=footer" width="100%" />

<div align="center">
  <p>Built with 🧡 for Hacker House Goa.</p>
</div>
