# ShadowNet Frontend

This is a React-based frontend for the ShadowNet protocol.

## Features
- Starknet wallet connection (ArgentX)
- Vault creation with mocked BTC collateral
- Commitment-based vault privacy
- Per-user vault tracking (localStorage)
- Synthetic asset minting (demo)
- No backend or indexer required

## Architecture
- Vault ownership tracked per wallet locally
- Smart contract used only for commitment storage
- UX mirrors real DeFi apps (Aave/Maker style)

## Pages
- Landing: wallet connect
- Vault: create vault + mock BTC lock
- Dashboard: view and interact with vaults

## Notes
- BTC locking is simulated
- Synthetic assets are UI-only
- Designed for hackathon demos

## Run Locally
```bash
npm install
npm run dev
