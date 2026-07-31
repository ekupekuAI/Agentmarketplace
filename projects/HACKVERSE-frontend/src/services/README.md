# Service boundaries

The UI must call service interfaces, never a wallet SDK, smart-contract client, or AI vendor SDK directly. Phase 2 runs use a deterministic local adapter and persist only in browser-local storage.

- `ai/` holds the provider-neutral agent-execution contract and local Demo AI adapter.
- `execution/` orchestrates runs, progress logs, timeouts, and browser-local history.
- `analytics/` derives user-facing metrics from execution history.
- `payments/` holds the future price-quote contract.
- `blockchain/` holds the future Algorand payment-submission contract.

The included implementations deliberately throw until the corresponding server-side and Algorand integrations are introduced in later phases.
