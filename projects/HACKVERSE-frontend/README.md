# AgentVerse frontend

AgentVerse is a Vite + React marketplace for discovering, publishing, paying for, running, and tracking AI agents on Algorand TestNet.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

## x402-paid agent execution

`POST /api/agents/:agentId/execute` is protected by official x402 Algorand TestNet middleware. The endpoint returns HTTP 402 until payment is verified by the configured facilitator. Gemini or Python execution starts only after verification.

1. Copy `.env.server.template` to `.env.server`.
2. Set `X402_PAY_TO_ADDRESS` to a TestNet address opted into TestNet USDC ASA `10458941`.
3. Set `GEMINI_API_KEY` server-side only.
4. Set `PYTHON_BIN` if Python is not available as `py`, `python3`, or `python`.
5. Run `npm.cmd run dev:api` and, in another terminal, `npm.cmd run dev`.
6. Connect Pera Wallet with TestNet USDC and run any marketplace agent.

The x402 receiver wallet and the payer wallet must both be opted into TestNet
USDC ASA `10458941`; otherwise facilitator settlement fails after Pera signing.

Leave `VITE_X402_API_URL` blank for the local Vite proxy, or set it to the deployed API origin.

## Creator workflow

Creator Studio publishes marketplace metadata only: name, description, category, price, version, endpoint, metadata hash, creator wallet, and owner. Model keys and Gemini configuration stay server-side and are never uploaded through the marketplace.

## Verify

```powershell
npm.cmd run typecheck
npm.cmd run build
```

## Notes

- Gemini agents run through the protected backend.
- Python agents run through the protected backend Python runtime.
- Wallet, payment, x402, and receipt code are isolated in services.
- The deployed AgentVerse TestNet application ID is `768352288`.
- Full AI outputs remain off-chain; compact execution hashes and receipts are recorded on-chain.
