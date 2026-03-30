# 🌑 ShadowNet Frontend Component

**A visually stunning, Apple Minimalist DApp powered by IPFS and Starknet.**

This directory contains the front-end user interface for the **ShadowNet** protocol, completely overhauled for the **Protocol Labs Genesis Hackathon**. 

## 🍏 The Aesthetic: Monochrome Minimalism
We scrapped our standard web3 interface to build a premium, native-feeling DApp. 
- **True Monochrome**: Clean white/gray palettes that prioritize data readability.
- **Micro-shadows & Geometry**: 18px radius cards replacing standard web3 boxy designs, giving the app an "Apple-like" premium feel.
- **Fluid Animation**: CSS fade-in animations allow for a seamless transition between Cryptographic Logs and the Vault Dashboard.

## 🚀 The Core Technology: Protocol Labs IPFS
ShadowNet vaults are supposed to be completely private. But private data requires **Data Availability**.

Our DApp integrates deeply with the **Pinata IPFS Gateway**. Every time a vault is generated:
1. The DApp packages the vault configuration JSON.
2. It pushes it securely to IPFS `pinJSONToIPFS`.
3. It derives a deterministic cryptographic commitment from the resulting `<IPFS_CID>` by hashing it down into a Starknet integer.
4. The Starknet wallet executes the transaction. 

### 💥 The Cryptographic Verifier Engine
Our Dashboard includes a **live verifier engine**. 
Because IPFS content-addressing guarantees that a CID will explicitly change if the data is tampered with, our engine can pull the CID, hash it in real-time on the browser, and do an absolute strict equality check (`===`) against the Starknet `getVault` blockchain state. 

**This tells the complete story of why IPFS and Starknet are perfectly complimentary technologies.**

## ⚙️ Running Locally
To test the DApp out for yourself, you'll need standard Node JS and an ArgentX/Braavos Starknet Wallet installed in your browser.

### 1. Configure the Environment
Ensure your `.env` contains your Pinata IPFS keys to allow the DApp to upload private data.
```bash
REACT_APP_PINATA_API_KEY="..."
REACT_APP_PINATA_API_SECRET="..."
REACT_APP_PINATA_JWT="..."
```

### 2. Start the App
```bash
npm install
npm start
```
*Wait for the localhost server to spin up, connect your Starknet wallet, and watch IPFS at work!*
