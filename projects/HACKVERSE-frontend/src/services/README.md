# Service boundaries

The UI calls service interfaces, not vendor SDKs directly.

- `ai/` holds provider-neutral execution contracts and the browser fallback adapter.
- `execution/` orchestrates local run lifecycle, progress logs, and history.
- `analytics/` derives metrics from real execution history.
- `payments/` owns the x402 client flow.
- `blockchain/` records compact AgentVerse TestNet execution receipts.
- `workspace/` owns local profile, settings, creator listings, and import/export.

Gemini and Python production execution live in `server/` so secrets stay out of the frontend bundle.
