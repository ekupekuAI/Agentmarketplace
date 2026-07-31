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

Frontend

```env
VITE_AGENTVERSE_APP_ID=768352288
```

Backend (Future AI Integration)

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Never commit secrets, mnemonics, or private keys.

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