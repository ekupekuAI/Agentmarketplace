# HACKVERSE / AgentVerse

This repository contains an AlgoKit smart-contract project and a Vite React frontend for AgentVerse.

## Projects

- `projects/HACKVERSE-contracts` — Algorand smart contract, deployment scripts, and generated Python client artifacts.
- `projects/HACKVERSE-frontend` — React SaaS-style frontend with local workspace persistence, Demo AI execution, wallet integration, TestNet payment service, and execution receipt UI.

## Setup

```powershell
algokit project bootstrap all
```

Frontend-only verification:

```powershell
cd projects/HACKVERSE-frontend
npx.cmd tsc --noEmit
npm.cmd run build
```

Contract deployment still follows the existing AlgoKit flow in `projects/HACKVERSE-contracts`. Do not hardcode mnemonics, private keys, or secrets; use environment variables.
