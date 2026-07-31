# AgentVerse frontend architecture

## Product surface

The React client delivers the landing page, marketplace, agent details, creator studio, profile, settings, execution, transaction history, and analytics dashboard. Features that normally require a backend use versioned browser-local persistence so users can complete workflows without authentication, an external database, or external storage.

## Directory map

```text
src/
├── components/       Reusable layout, cards, wallet, feedback, and execution UI
├── data/             Built-in agent catalog and dynamic form definitions
├── pages/            Route-level product screens
├── router/           Dependency-free route table and browser-history router
├── services/
│   ├── ai/           Provider-neutral execution interface and Demo AI adapter
│   ├── analytics/    Dashboard metrics derived from local execution history
│   ├── blockchain/   Algorand TestNet app config and receipt-recording service
│   ├── execution/    Run lifecycle, validation, timeouts, logs, and history
│   ├── payments/     TestNet ALGO payment service
│   └── workspace/    Local agents, profile, settings, import/export persistence
├── types/            Shared marketplace domain models
├── utils/            AlgoKit network configuration helpers
└── wallet/           Wallet manager setup
```

## Boundaries

- Pages compose components and call services; service modules own execution, persistence, payments, blockchain receipts, and analytics.
- `services/ai` accepts injectable providers. `DemoAiProvider` is enabled by default; OpenAI, OpenRouter, Anthropic, and Gemini remain provider IDs for later secure adapters.
- `services/workspace` is the local source of truth for creator agents, profile data, settings, and workspace import/export.
- `services/execution` owns progress logs, provider timeouts, retry-safe history updates, and result persistence.
- `services/blockchain` and `services/payments` use TestNet configuration when available. If deployment credentials or app IDs are absent, execution falls back to local receipts without changing the UI flow.

## Production rules

- Keep SDK calls inside services, not pages, unless a framework hook is required at the route boundary.
- Preserve local persistence as the no-backend implementation until authentication, storage, or a hosted API is introduced.
- Do not store secrets, mnemonics, or private keys in frontend code.
- Keep full AI result payloads off-chain; store compact receipt metadata and hashes only.
