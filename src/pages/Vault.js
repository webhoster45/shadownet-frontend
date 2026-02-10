/* global BigInt */


import { useState, useEffect } from "react";
import { createVault } from "../utils/starknet";
import { keccak256, toUtf8Bytes } from "ethers";



export default function Vault({ account }) {
  const [btcAmount, setBtcAmount] = useState("");
  const [status, setStatus] = useState("");

  const [activeVaults, setActiveVaults] = useState(0);
  const [totalBtcLocked, setTotalBtcLocked] = useState(0);

  useEffect(() => {
    const v = localStorage.getItem("activeVaults");
    const btc = localStorage.getItem("totalBtcLocked");

    if (v) setActiveVaults(Number(v));
    if (btc) setTotalBtcLocked(Number(btc));
  }, []);

  async function handleCreateVault() {
    if (!account) {
      alert("Connect wallet first");
      return;
    }

    try {
const vaultId = Date.now();

// === REAL COMMITMENT ===
const nonce = Date.now().toString();

const hash = keccak256(
  toUtf8Bytes(`${btcAmount}:${nonce}`)
);

// Starknet field prime (felt252)
const STARKNET_PRIME = BigInt(
  "0x800000000000011000000000000000000000000000000000000000000000001"
);

// Reduce hash into felt range
const commitment = (
  BigInt(hash) % STARKNET_PRIME
).toString();




      setStatus("Locking BTC (mock) and creating vault...");

      const txHash = await createVault(
        account,
        vaultId,
        commitment
      );

      // === UPDATE STATS ===
      const newVaults = activeVaults + 1;
      const newBtc =
        totalBtcLocked + Number(btcAmount || 0);

      setActiveVaults(newVaults);
      setTotalBtcLocked(newBtc);

      localStorage.setItem("activeVaults", newVaults);
      localStorage.setItem("totalBtcLocked", newBtc);

      // === STORE VAULT BTC (already existed) ===
      localStorage.setItem(
        `vault_btc_${vaultId}`,
        btcAmount
      );
      localStorage.setItem(
  `vault_nonce_${vaultId}`,
  nonce
);


      // === 🔥 THIS IS THE MISSING PIECE ===
      const vaultKey = `shadownet_vaults_${account.address}`;
      const existingVaults =
        JSON.parse(localStorage.getItem(vaultKey)) || [];

      existingVaults.push({
        vaultId,
        commitment,
        btcLocked: btcAmount,
        createdAt: Date.now(),
      });

      localStorage.setItem(
        vaultKey,
        JSON.stringify(existingVaults)
      );

      setStatus(
        `Vault created successfully!

Mock BTC locked: ${btcAmount} BTC
Vault ID: ${vaultId}
Commitment stored on-chain
Tx: ${txHash}`
      );

      setBtcAmount("");
    } catch (err) {
      console.error(err);
      setStatus("Vault creation failed");
    }
  }

  return (
    <div>
      {/* === STATS === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div className="card">
          <h4>BTC Locked</h4>
          <p style={{ fontSize: "20px", margin: 0 }}>
            {totalBtcLocked.toFixed(2)} BTC
          </p>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>
            Simulated collateral
          </span>
        </div>

        <div className="card">
          <h4>Active Vaults</h4>
          <p style={{ fontSize: "20px", margin: 0 }}>
            {activeVaults}
          </p>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>
            Persisted locally
          </span>
        </div>

        <div className="card">
          <h4>Privacy Mode</h4>
          <p style={{ fontSize: "16px", margin: 0 }}>
            Enabled
          </p>
          <span style={{ fontSize: "12px", opacity: 0.6 }}>
            Commitments only
          </span>
        </div>
      </div>

      {/* === CREATE VAULT === */}
      <div className="card">
        <h2>Lock BTC & Create Vault</h2>

        <input
          placeholder="BTC amount (mock)"
          value={btcAmount}
          onChange={(e) =>
            setBtcAmount(e.target.value)
          }
        />

        <button style={{borderRadius:"8px"}} onClick={handleCreateVault}>
          Lock BTC & Create Vault
        </button>

        <pre style={{ whiteSpace: "pre-wrap" }}>
          {status}
        </pre>
      </div>
    </div>
  );
}
