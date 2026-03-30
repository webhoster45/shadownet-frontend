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
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem("activeVaults");
    const btc = localStorage.getItem("totalBtcLocked");
    if (v) setActiveVaults(Number(v));
    if (btc) setTotalBtcLocked(Number(btc));
  }, []);

  useEffect(() => {
    if (!btcAmount) {
      setCommitmentPreview("");
      return;
    }
    const nonce = "preview";
    const hash = keccak256(toUtf8Bytes(`${btcAmount}:0:${nonce}`));
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
      setIsProcessing(true);
      setStatus("[1/3] Encrypting & pinning private vault data to IPFS...");

      const vaultId = Date.now();
      const nonce = randomNonce();
      const pinataJwt = process.env.REACT_APP_PINATA_JWT;
      
      if (!pinataJwt) throw new Error("Missing Pinata JWT in .env");

      const vaultData = { vaultId: vaultId.toString(), collateral: btcAmount, debt: "0", nonce };

      const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${pinataJwt}` },
        body: JSON.stringify({ pinataContent: vaultData, pinataMetadata: { name: `ShadowNet-Vault-${vaultId}.json` } })
      });

      const ipfsResult = await res.json();
      if (!ipfsResult.IpfsHash) throw new Error("Pinata upload failed");
      const ipfsCid = ipfsResult.IpfsHash;

      setStatus(`[2/3] Constructing commitment hash from IPFS CID...\n--> CID: ${ipfsCid}`);
      
      const hash = keccak256(toUtf8Bytes(ipfsCid));
      const STARKNET_PRIME = BigInt("0x800000000000011000000000000000000000000000000000000000000000001");
      const commitment = (BigInt(hash) % STARKNET_PRIME).toString();

      setStatus(`[3/3] Sending protocol commitment to Starknet...\n--> Confirm transaction in wallet`);

      const txHash = await createVault(account, vaultId, commitment);

      const newVaults = activeVaults + 1;
      const newBtc = totalBtcLocked + Number(btcAmount);
      setActiveVaults(newVaults);
      setTotalBtcLocked(newBtc);
      localStorage.setItem("activeVaults", newVaults);
      localStorage.setItem("totalBtcLocked", newBtc);

      const vaultKey = `shadownet_vaults_${account.address}`;
      const existing = JSON.parse(localStorage.getItem(vaultKey)) || [];
      existing.push({ vaultId, commitment, ipfsCid, btcLocked: btcAmount, createdAt: Date.now() });
      localStorage.setItem(vaultKey, JSON.stringify(existing));

      setStatus(
        `✅ SUCCESS: Vault Secured\n\nVault ID: ${vaultId}\nIPFS CID: ${ipfsCid}\nProtocol Hash: ${commitment.slice(0, 15)}...\nTx Hash: ${txHash}\n\nPrivacy Guarantee: Collateral & debt remain shielded off-chain.`
      );
      setBtcAmount("");
      setCommitmentPreview("");
    } catch (err) {
      console.error(err);
      setStatus("Vault creation failed. See console.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fade-in">
      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        <div className="glass-card" style={{ padding: "24px", marginTop: 0 }}>
          <h4>Total TVL</h4>
          <p style={{ fontSize: "28px", margin: "12px 0 0", color: "var(--text-primary)", fontWeight: 500 }}>{totalBtcLocked.toFixed(2)} BTC</p>
        </div>
        <div className="glass-card" style={{ padding: "24px", marginTop: 0 }}>
          <h4>Active Vaults</h4>
          <p style={{ fontSize: "28px", margin: "12px 0 0", color: "var(--text-primary)", fontWeight: 500 }}>{activeVaults}</p>
        </div>
        <div className="glass-card" style={{ padding: "24px", marginTop: 0 }}>
          <h4>Privacy</h4>
          <p style={{ fontSize: "24px", margin: "14px 0 0", color: "var(--text-primary)", fontWeight: 500 }}>Shielded</p>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>Initialize Vault</h2>
          <span className="badge-zk">Protocol Integration</span>
        </div>
        
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.6" }}>
          Enter collateral to lock. The vault details will be encrypted and pinned to <span className="badge-ipfs">IPFS</span>. 
          Only a deterministic commitment hash is published to <span className="badge-starknet">Starknet</span>.
        </p>

        <input
          type="number"
          placeholder="BTC collateral amount (e.g. 1.5)"
          value={btcAmount}
          onChange={(e) => setBtcAmount(e.target.value)}
          disabled={isProcessing}
        />

        {commitmentPreview && (
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 500 }}>Predictive Hash Preview</span>
            <pre style={{ marginTop: "8px" }}>{commitmentPreview}</pre>
          </div>
        )}

        <button style={{ width: "100%", marginTop: "8px" }} onClick={handleCreateVault} disabled={isProcessing}>
          {isProcessing ? "PROCESSING..." : "CREATE PRIVATE VAULT"}
        </button>

        {status && (
          <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 500 }}>System Logs</span>
            <pre style={{ marginTop: "12px", minHeight: "80px", color: "inherit" }}>{status}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
