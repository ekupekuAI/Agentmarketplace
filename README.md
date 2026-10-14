# 🚀 HACKVERSE (AgentVerse)

> A decentralized AI Agent Marketplace built on Algorand, where users discover, purchase, and execute AI-powered agents with transparent on-chain payments and execution receipts.

![Status](https://img.shields.io/badge/Status-Active-success)
![Blockchain](https://img.shields.io/badge/Blockchain-Algorand-blue)
![Network](https://img.shields.io/badge/Network-TestNet-green)
![Frontend](https://img.shields.io/badge/Frontend-React%20+%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Python-orange)

---

# 🌟 Overview

AgentVerse is an AI Agent Marketplace that combines modern AI with Algorand blockchain.

Users can:

- 🤖 Discover AI agents
- 💳 Pay using Algorand TestNet
- 🔐 Connect with Pera Wallet
- ⚡ Execute AI agents
- 📜 Receive immutable blockchain execution receipts
- 👨‍💻 Publish new AI agents (extensible)

Unlike traditional AI apps, AgentVerse records payments and execution metadata on-chain while AI processing happens off-chain for speed and scalability.

---

# ✨ Features

## Blockchain

- ✅ Algorand Smart Contract
- ✅ TestNet Deployment
- ✅ Live Application ID
- ✅ On-chain Agent Registry
- ✅ Execution Receipts
- ✅ Wallet Payments
- ✅ Pera Wallet Integration

## AI Platform

- Demo AI execution
- Provider abstraction
- Ready for Gemini integration
- Ready for OpenAI integration
- Modular agent architecture

## Frontend

- React + Vite
- TypeScript
- Responsive UI
- Marketplace
- Agent Details
- Execution History
- Dashboard
- Wallet Connection

---

# 🏗 Project Structure

```
HACKVERSE/
│
├── projects/
│
├── HACKVERSE-contracts/
│   ├── Smart Contracts
│   ├── Deployment Scripts
│   ├── Python Client
│   └── AgentVerse Contract
│
└── HACKVERSE-frontend/
    ├── React
    ├── Wallet
    ├── Marketplace
    ├── Dashboard
    ├── Execution History
    └── Blockchain Services
```

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite

## Blockchain

- Algorand
- AlgoKit
- PyTEAL
- Python

## Wallet

- Pera Wallet
- WalletConnect

## AI

- Demo AI
- Gemini (Pluggable)
- OpenAI (Pluggable)

---

# 📦 Installation

Clone the repository

```bash
git clone <repository-url>
cd HACKVERSE
```

Bootstrap the workspace

```bash
algokit project bootstrap all
```

---

# ▶ Run Frontend

```bash
cd projects/HACKVERSE-frontend
npm install
npm run dev
```

No `.env` is required: the frontend defaults to Algorand TestNet via the public AlgoNode endpoints.

# ▶ Run the AI / x402 API server

```bash
cd projects/HACKVERSE-frontend
cp .env.server.template .env.server   # then fill in the values below
npm run dev:api                       # listens on PORT (default 4021); Vite proxies /api to it
```

The server starts even with nothing configured. Missing pieces produce clear errors instead of placeholder results: a missing AI key or x402 address returns a message saying exactly what to add, **before** any payment is requested. A run that fails is never settled, so the user is not charged.

Build production

```bash
npm run build
```

---

# 🔗 Smart Contract Deployment

Deploy the smart contract

```bash
algokit project deploy
```

Current TestNet Application

```
Application ID:
768352288
```

---

# 🔑 Environment Variables

Templates: `projects/HACKVERSE-frontend/.env.template` (frontend) and `.env.server.template` (API server). Copy them to `.env` / `.env.server`; both are git-ignored.

| Variable | Where | Required | Purpose / where to get it |
| --- | --- | --- | --- |
| `VITE_ALGOD_SERVER`, `VITE_ALGOD_NETWORK`, … | `.env` | No | Algod/indexer endpoints. Default: AlgoNode TestNet. |
| `VITE_AGENTVERSE_APP_ID` | `.env` | No | AgentVerse app id. Default `768352288` (TestNet). |
| `GEMINI_API_KEY` | `.env.server` | For LLM agents* | https://aistudio.google.com/apikey |
| `GEMINI_MODEL` | `.env.server` | No | Default `gemini-2.5-flash`. |
| `OPENROUTER_API_KEY` | `.env.server` | For LLM agents* | Fallback provider, https://openrouter.ai/keys |
| `OPENROUTER_MODEL` | `.env.server` | No | Default `openrouter/free`. |
| `X402_PAY_TO_ADDRESS` | `.env.server` | For paid runs | Your TestNet address, opted into TestNet USDC (ASA 10458941). |
| `X402_PAYER_ADDRESS` | `.env.server` | No | Only used by `npm run check:x402`. |
| `X402_FACILITATOR_URL` | `.env.server` | No | Default `https://facilitator.goplausible.xyz`. |
| `PYTHON_BIN` | `.env.server` | No | Python 3 for the document/CSV/OCR agents (auto-detected). |
| `PORT`, `WEB_ORIGIN` | `.env.server` | No | API port (default 4021) and CORS origin. |
| `API_PROXY_TARGET` | shell | No | Point the Vite `/api` proxy at a different API port. |

\* At least one of `GEMINI_API_KEY` / `OPENROUTER_API_KEY` is needed for Resume Analyzer, Research Assistant, Interview Coach, Code Reviewer and Business Validator.

Never commit secrets, mnemonics, or private keys.

---

# 🛠 What changed in this version

| Before | After |
| --- | --- |
| Blank page on a fresh clone (no `.env` → wallet manager threw) | Defaults to AlgoNode TestNet; `.env.template` now defaults to TestNet |
| API server crashed on start without `X402_PAY_TO_ADDRESS`; `npm run dev:api` aborted without `.env.server` | Starts anyway and explains what to configure |
| Paid runs with no AI key / failed provider returned a placeholder "Fallback completed" result | Clear "add your API key" error before payment; provider failures are errors, so x402 does not settle |
| Prices shown as `0.8 ALGO` etc. while x402 actually charged `$0.001` USDC | Prices show `0.001 USDC` |
| Explorer links pointed to AlgoExplorer (shut down) | Links go to Lora (`lora.algokit.io`) |
| A failed on-chain receipt discarded the result the user had just paid for | Result is kept; the receipt error is shown |
| Browser fallback crashed for every agent except Research Assistant | Fixed |
| CSV agent showed `[object Object]` for missing values / numeric summary | Readable lists |
| Connect button was Pera-only (LocalNet/KMD and the wallet setting did nothing) | Uses the wallet chosen in Settings, falls back to the configured one |
| Settings toggles (receipts, downloads, verification badges, high-contrast theme) had no effect | Wired up |
| Default Gemini model `gemini-2.0-flash` (retired) | `gemini-2.5-flash` |

---

# 💳 Wallet

AgentVerse uses:

- Pera Wallet
- WalletConnect
- Algorand TestNet

---

# 🤖 AI Providers

Current

- Demo AI ✅

Ready

- Gemini
- OpenAI
- Anthropic
- Ollama

---

# 📜 Workflow

```
User
   │
   ▼
Connect Wallet
   │
   ▼
Pay via Algorand
   │
   ▼
Smart Contract
   │
   ▼
Execute AI Agent
   │
   ▼
Store Receipt
   │
   ▼
View History
```

---

# 📁 Main Projects

## HACKVERSE Contracts

Contains

- AgentVerse Smart Contract
- Deployment Configuration
- Generated Client
- Blockchain Logic

## HACKVERSE Frontend

Contains

- Marketplace
- Wallet
- Dashboard
- AI Execution
- History
- Blockchain Services

---

# 🔮 Roadmap

- Gemini Integration
- AI Streaming Responses
- User Published Agents
- Ratings & Reviews
- Revenue Dashboard
- Multi-Agent Workflows
- MainNet Deployment

---

# 👥 Team

Built during a Hackathon using

- Algorand
- AlgoKit
- React
- TypeScript
- Python
- Pera Wallet

---

# 📄 License

This project is intended for educational, research, and hackathon purposes.

---

## ⭐ AgentVerse

**Discover. Pay. Execute. Verify.**

AI Agents powered by Algorand Blockchain.


---

# 👨‍💻 Author

**Ekansh**

Founder & Lead Developer of **HACKVERSE (AgentVerse)**

- 🌐 AI & Blockchain Developer
- 🤖 AI Agent Systems
- ⚡ Algorand Smart Contract Developer
- 💻 Full Stack Developer

---

# © Copyright

Copyright © 2026 Ekansh.

All Rights Reserved.

HACKVERSE (AgentVerse), including its source code, smart contracts, frontend, backend, UI/UX, architecture, documentation, branding, and associated assets, is the intellectual property of **Ekansh**, unless otherwise stated.

No part of this project may be copied, modified, distributed, or used for commercial purposes without prior written permission from the copyright holder.

---

# 🙏 Acknowledgements

Built with ❤️ using:

- Algorand
- AlgoKit
- Python
- React
- TypeScript
- Vite
- Pera Wallet
- WalletConnect

Special thanks to the open-source community and everyone whose tools and libraries made this project possible.

---

## 🚀 HACKVERSE (AgentVerse)

**Discover. Pay. Execute. Verify.**

*Building the future of decentralized AI agent marketplaces.*