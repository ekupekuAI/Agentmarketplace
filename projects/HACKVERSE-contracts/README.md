# HACKVERSE contracts

This project contains the AgentVerse Algorand smart contract and its AlgoKit-compatible build/deploy entry point.

## Contract layout

```text
smart_contracts/
├── __main__.py              Build/deploy entry point used by AlgoKit
├── agent_verse/
│   ├── contract.py          AgentVerse ARC-4 smart contract
│   └── deploy_config.py     Deployment and built-in agent registration
└── artifacts/
    └── agent_verse/         Generated ARC-56 app spec, TEAL, maps, and Python client
```

## Build

```powershell
poetry run python -m smart_contracts build
```

To build only AgentVerse:

```powershell
poetry run python -m smart_contracts build agent_verse
```

## Deploy

```powershell
poetry run python -m smart_contracts deploy
```

To deploy only AgentVerse:

```powershell
poetry run python -m smart_contracts deploy agent_verse
```

Deployment reads account and network configuration from environment variables through AlgoKit Utils. Do not hardcode mnemonics, private keys, or secrets.

The deployment script registers the four built-in AgentVerse agents after the app is created or resolved.
