/* global BigInt */

import { useState, useEffect } from "react";
import { createVault } from "../utils/starknet";
import { keccak256, toUtf8Bytes } from "ethers";

function randomNonce() {
  return crypto.randomUUID();
}

export default function Vault({ account }) {
  const [btcAmount, setBtcAmount] = useState("");
  const [status, setStatus] = useState("");
  const [commitmentPreview, setCommitmentPreview] = useState("");

  const [activeVaults, setActiveVaults] = useState(0);
  const [totalBtcLocked, setTotalBtcLocked] = useState(0);

  // Load persisted stats
  useEffect(() => {
    const v = localStorage.getItem("activeVaults");
    const btc = localStorage.getItem("totalBtcLocked");

    if (v) setActiveVaults(Number(v));
    if (btc) setTotalBtcLocked(Number(btc));
  }, []);

  // Live commitment preview (UX credibility)
  useEffect(() => {
    if (!btcAmount) {
      setCommitmentPreview("");
      return;
    }

    const nonce = "preview";
    const hash = keccak256(
      toUtf8Bytes(`${btcAmount}:0:${nonce}`)
    );

    setCommitmentPreview(hash.slice(0, 18) + "...");
  }, [btcAmount]);

  async function handleCreateVault() {
    if (!account) {
      alert("Connect wallet first");
      return;
    }

    if (!btcAmount || Number(btcAmount) <= 0) {
      setStatus("Enter a valid BTC collateral amount.");
      return;
    }

    try {
      setStatus("Generating private vault commitment...");

      const vaultId = Date.now();
      const nonce = randomNonce();

      // === Protocol Commitment ===
      // H(collateral, debt, nonce, vaultId)
      const hash = keccak256(
        toUtf8Bytes(`${btcAmount}:0:${nonce}:${vaultId}`)
      );

      // Starknet felt prime
      const STARKNET_PRIME = BigInt(
        "0x800000000000011000000000000000000000000000000000000000000000001"
      );

      // Reduce into felt range
      const commitment = (
        BigInt(hash) % STARKNET_PRIME
      ).toString();

      setStatus("Sending transaction to Starknet...");

      const txHash = await createVault(
        account,
        vaultId,
        commitment
      );

      // === Update stats ===
      const newVaults = activeVaults + 1;
      const newBtc = totalBtcLocked + Number(btcAmount);

      setActiveVaults(newVaults);
      setTotalBtcLocked(newBtc);

      localStorage.setItem("activeVaults", newVaults);
      localStorage.setItem("totalBtcLocked", newBtc);

      // Store vault locally for dashboard list
      const vaultKey = `shadownet_vaults_${account.address}`;
      const existing =
        JSON.parse(localStorage.getItem(vaultKey)) || [];

      existing.push({
        vaultId,
        commitment,
        btcLocked: btcAmount,
        createdAt: Date.now(),
      });

      localStorage.setItem(vaultKey, JSON.stringify(existing));

      setStatus(
        `✅ Vault created successfully

Vault ID: ${vaultId}
Commitment stored on-chain ✔️
Tx Hash: ${txHash}

Privacy Guarantee:
Collateral + debt remain hidden behind the commitment.`
      );

      setBtcAmount("");
      setCommitmentPreview("");
    } catch (err) {
      console.error(err);
      setStatus("Vault creation failed.");
    }
  }

  return (
    <div>
      {/* === NETWORK STATS === */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "16px",
        }}
      >
        <div className="card">
          <h4>Total BTC Locked</h4>
          <p style={{ fontSize: "20px", margin: 0 }}>
            {totalBtcLocked.toFixed(2)} BTC
          </p>
          <span style={{ fontSize: "12px", opacity: 0.65 }}>
            Prototype collateral layer
          </span>
        </div>

        <div className="card">
          <h4>Active Vaults</h4>
          <p style={{ fontSize: "20px", margin: 0 }}>
            {activeVaults}
          </p>
          <span style={{ fontSize: "12px", opacity: 0.65 }}>
            Commitments stored on Starknet
          </span>
        </div>

        <div className="card">
          <h4>Privacy Mode</h4>
          <p style={{ fontSize: "16px", margin: 0 }}>
            Enabled ✔️
          </p>
          <span style={{ fontSize: "12px", opacity: 0.65 }}>
            No vault balances revealed
          </span>
        </div>
      </div>

      {/* === CREATE VAULT FLOW === */}
      <div className="card">
        <h2>Create a Private BTC Vault</h2>

        <p style={{ fontSize: "13px", opacity: 0.75 }}>
          ShadowNet vaults store only cryptographic commitments on-chain.
          Collateral and debt remain confidential by design.
        </p>

        <input
          placeholder="BTC collateral amount (prototype)"
          value={btcAmount}
          onChange={(e) => setBtcAmount(e.target.value)}
        />

        {/* Commitment Preview */}
        {commitmentPreview && (
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "8px",
              background: "#111521",
              fontSize: "12px",
              opacity: 0.85,
            }}
          >
            <strong>Commitment Preview:</strong>
            <br />
            {commitmentPreview}
          </div>
        )}

        <button
          style={{
            marginTop: "14px",
            borderRadius: "10px",
            padding: "10px",
          }}
          onClick={handleCreateVault}
        >
          Lock BTC & Create Vault
        </button>

        {/* Status Output */}
        <pre
          style={{
            whiteSpace: "pre-wrap",
            marginTop: "14px",
            fontSize: "12px",
            opacity: 0.85,
          }}
        >
          {status}
        </pre>

        {/* Proof-ready framing */}
        <div
          style={{
            marginTop: "14px",
            fontSize: "12px",
            opacity: 0.7,
          }}
        >
          Next step: integrate ZK solvency proofs so Starknet can verify
          vault safety without revealing balances.
        </div>
      </div>
    </div>
  );
}
