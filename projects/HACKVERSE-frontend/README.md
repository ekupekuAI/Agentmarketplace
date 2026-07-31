# AgentVerse frontend

AgentVerse is a Vite + React frontend for discovering, creating, running, and tracking AI agents with Algorand TestNet integration points.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

## Verify

```powershell
npx.cmd tsc --noEmit
npm.cmd run build
```

## Notes

- The default AI adapter is `DemoAiProvider`, a deterministic local provider for demos and offline development.
- Live AI providers must be added through secure server-side adapters; no API keys belong in this frontend.
- Wallet/payment/receipt code is kept in service modules and reads TestNet configuration from environment variables.
- The deployed AgentVerse TestNet application ID is `768352288` and is exposed through `VITE_AGENTVERSE_APP_ID`.
- Generated smart-contract clients belong in `src/contracts` and should be regenerated through the standard AlgoKit flow, not edited by hand.

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for architecture details.
