# AgentVerse architecture

## Product surface

The React client delivers marketplace, agent details, Creator Studio, profile, settings, execution, transaction history, and analytics. Browser-local persistence is used for user workspace data where authentication or external databases would otherwise be required.

## Directory map

```text
src/
  components/       Reusable layout, cards, wallet, feedback, and execution UI
  data/             Built-in agent catalog and dynamic form definitions
  pages/            Route-level product screens
  router/           Browser-history router
  services/
    ai/             Provider-neutral execution interfaces and browser fallback
    analytics/      Dashboard metrics derived from execution history
    blockchain/     AgentVerse TestNet app config and receipt recording
    execution/      Run lifecycle, logs, validation, and history
    payments/       x402 client integration
    workspace/      Local listings, profile, settings, import/export persistence
  types/            Shared marketplace domain models
  utils/            AlgoKit network helpers
  wallet/           Pera wallet manager setup

server/
  index.ts          x402-protected resource server, Gemini adapter, logs, retry, timeout
  python_agents.py  Python runtime for document, CSV, and OCR capture agents
```

## Boundaries

- Pages compose UI and call services.
- The frontend never imports the Gemini SDK and never stores API keys.
- `services/payments` owns x402 client payment retry.
- `server/` owns protected execution. It returns HTTP 402 before payment and runs Gemini or Python only after verification.
- `services/blockchain` records compact execution metadata against AgentVerse App ID `768352288`.
- Creator Studio stores listing metadata only: endpoint, hash, owner, wallet, price, version, category, name, and description.

## Production rules

- Keep secrets, mnemonics, and API keys out of frontend code.
- Keep full prompts and AI outputs off-chain.
- Use official x402 Algorand AVM flow with full Algorand TestNet CAIP-2 network `algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=` and TestNet USDC ASA `10458941`.
- Preserve generated AlgoKit clients; regenerate through AlgoKit instead of editing generated files.
