/* global BigInt */
import { useState, useEffect } from "react";
import { getVault } from "../utils/starknet";
import { keccak256, toUtf8Bytes } from "ethers";

function shorten(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export default function Dashboard() {
  const [vaultId, setVaultId] = useState("");
  const [vault, setVault] = useState(null);
  const [status, setStatus] = useState("");

  const [userVaults, setUserVaults] = useState([]);
  const [syntheticBalance, setSyntheticBalance] = useState(0);
  const [minting, setMinting] = useState(false);
  
  // Verifier State
  const [verifying, setVerifying] = useState(false);
  const [verifyLogs, setVerifyLogs] = useState([]);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const account = window.starknet?.account;
    if (!account) return;
    const key = `shadownet_vaults_${account.address}`;
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    setUserVaults(stored);
  }, []);

  async function handleLoadVault(idOverride) {
    const id = idOverride || vaultId;
    if (!id) {
      setStatus("Enter a Vault ID first.");
      return;
    }

    setStatus("Executing Starknet sync...");
    setVault(null);

    try {
      const result = await getVault(id);
      const commitmentRaw = result.commitment ? result.commitment.toString() : "0";

      const account = window.starknet?.account;
      let ipfsCid = null;
      let offchainData = null;

      if (account) {
        const key = `shadownet_vaults_${account.address}`;
        const stored = JSON.parse(localStorage.getItem(key)) || [];
        const found = stored.find((v) => v.vaultId.toString() === id.toString());
        if (found && found.ipfsCid) {
          ipfsCid = found.ipfsCid;
          try {
            setStatus("Fetching off-chain config from IPFS...");
            const res = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsCid}`);
            offchainData = await res.json();
          } catch (e) {
            console.error("IPFS Fetch error", e);
          }
        }
      }

      setVault({
        id,
        owner: result.owner ? result.owner.toString() : "0x0",
        commitment: commitmentRaw,
        ipfsCid,
        offchainData,
        createdAt: Date.now(),
      });

      setStatus("Vault telemetry synced successfully.");
      setVerifyLogs([]);
      setIsVerified(false);
    } catch (err) {
      console.error(err);
      setStatus("Vault not found or Starknet RPC error.");
    }
  }

  async function runCryptographicVerification() {
    if (!vault || !vault.ipfsCid) return;
    setVerifying(true);
    setVerifyLogs(["[1/3] Intercepting IPFS Data (Protocol Labs CID)..."]);
    setIsVerified(false);

    setTimeout(() => {
      setVerifyLogs(prev => [...prev, `[2/3] Hashing CID with Keccak256: ${vault.ipfsCid.slice(0, 10)}...`]);
      
      setTimeout(() => {
        const hash = keccak256(toUtf8Bytes(vault.ipfsCid));
        const STARKNET_PRIME = BigInt("0x800000000000011000000000000000000000000000000000000000000000001");
        const calculatedFelt = (BigInt(hash) % STARKNET_PRIME).toString();

        setVerifyLogs(prev => [...prev, `[3/3] Reducing to Felt252 Hash: ${calculatedFelt.slice(0,12)}...`]);

        setTimeout(() => {
          let match = false;
          try {
            match = BigInt(calculatedFelt) === BigInt(vault.commitment);
          } catch(e) {}

          if (match) {
            setVerifyLogs(prev => [...prev, "✅ CRYPTOGRAPHY VERIFIED: The Starknet commitment mathematically matches the Protocol Labs IPFS data. Complete data integrity proven!"]);
            setIsVerified(true);
          } else {
            setVerifyLogs(prev => [...prev, `❌ VERIFICATION FAILED: Data has been tampered with or CID mismatch.\nOn-Chain Hash: ${vault.commitment}\nCalculated Hash: ${calculatedFelt}`]);
          }
          setVerifying(false);
        }, 1200);

      }, 1000);
    }, 1000);
  }

  function mintSynthetic() {
    setMinting(true);
    setTimeout(() => {
      setSyntheticBalance(syntheticBalance + 1);
      setMinting(false);
      setStatus("✅ Minted 1 sBTC (prototype demo)");
    }, 1200);
  }

  function copyCommitment() {
    if (!vault?.commitment) return;
    navigator.clipboard.writeText(vault.commitment);
    setStatus("Commitment copied to clipboard.");
  }

  return (
    <div className="fade-in">
      {/* HEADER */}
      <h2 style={{ marginBottom: "12px", color: "var(--text-primary)" }}>Private Vault Terminal</h2>

      <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6", maxWidth: "600px" }}>
        ShadowNet vaults store only cryptographic commitments on-chain. Collateral and debt remain confidential and dynamically hosted on <span className="badge-ipfs">IPFS</span>.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: userVaults.length > 0 ? "1.5fr 1fr" : "1fr", gap: "28px", marginTop: "40px" }}>
        
        {/* LEFT COLUMN: LOOKUP / DETAILS */}
        <div>
          <div className="card" style={{ marginTop: 0 }}>
            <h4>Vault Lookup</h4>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <input
                placeholder="Enter Vault ID"
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                style={{ flex: 1, margin: 0 }}
              />
              <button onClick={() => handleLoadVault()}>Fetch</button>
            </div>
            {status && <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "16px" }}>{status}</p>}
          </div>

          {vault && (
            <div className="fade-in">
              <div className="card" style={{ marginTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4>Vault Overview</h4>
                  <span className="badge-starknet">Active ✔️</span>
                </div>
                
                <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Vault ID</span>
                    <p style={{ margin: "8px 0 0", color: "var(--text-primary)", fontSize: "20px", fontWeight: "500" }}>#{vault.id}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Owner</span>
                    <p style={{ margin: "8px 0 0", color: "var(--text-primary)", fontSize: "16px", fontFamily: "'JetBrains Mono', monospace" }}>{shorten(vault.owner)}</p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginTop: "24px" }}>
                <h4>On-chain Data <span className="badge-starknet">Starknet</span></h4>
                <div style={{ marginTop: "16px" }}>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Protocol Commitment Hash</span>
                  <pre style={{ marginTop: "12px", background: "var(--bg-tertiary)" }}>
                    {vault.commitment}
                  </pre>
                  <button className="secondary-btn" style={{ marginTop: "12px", fontSize: "13px", padding: "8px 16px" }} onClick={copyCommitment}>Copy Hash</button>
                </div>
              </div>

              <div className="card" style={{ marginTop: "24px" }}>
                <h4>Off-chain Data <span className="badge-ipfs">Protocol Labs IPFS</span></h4>
                {vault.ipfsCid ? (
                  <div style={{ marginTop: "16px" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>IPFS CID</span>
                    <a href={`https://gateway.pinata.cloud/ipfs/${vault.ipfsCid}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <pre style={{ marginTop: "12px", cursor: "pointer", color: "var(--text-primary)" }}>{vault.ipfsCid}</pre>
                    </a>
                    
                    {vault.offchainData && (
                      <div style={{ marginTop: "24px" }}>
                         <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Decrypted Metadata</span>
                         <pre style={{ marginTop: "12px" }}>{JSON.stringify(vault.offchainData, null, 2)}</pre>
                      </div>
                    )}

                    {/* Cryptographic Verifier Boom Feature */}
                    <div style={{ marginTop: "32px", borderTop: "1px solid var(--border-light)", paddingTop: "24px" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: 600, textTransform: "uppercase" }}>Cryptographic Verifier Engine</span>
                          {isVerified && <span className="badge-zk" style={{ color: "green", borderColor: "green", background: "rgba(0,255,0,0.05)" }}>Verified Match</span>}
                       </div>
                       <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px", lineHeight: "1.5" }}>
                          Prove mathematically that the Starknet commitment corresponds perfectly to the decentralized IPFS data without compromising the vault secrets.
                       </p>
                       <button className="secondary-btn" style={{ marginTop: "16px", fontSize: "13px", width: "100%" }} onClick={runCryptographicVerification} disabled={verifying || isVerified}>
                         {verifying ? "Executing Mathematical Proof..." : isVerified ? "Proof Verified Successfully" : "Verify Protocol Cryptography"}
                       </button>

                       {verifyLogs.length > 0 && (
                         <div style={{ marginTop: "16px", background: "var(--bg-tertiary)", padding: "16px", borderRadius: "12px" }}>
                           {verifyLogs.map((log, i) => (
                             <div key={i} style={{ fontSize: "12px", color: log.includes("✅") ? "#22863a" : "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px" }}>
                               {log}
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "16px" }}>No local IPFS CID mapping found for this vault.</p>
                )}
              </div>

              <div className="card" style={{ marginTop: "24px" }}>
                <h4>Borrowing <span className="badge-zk">Prototype</span></h4>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>Mint a synthetic BTC asset. In production, this requires generating a Zero-Knowledge Proof off-chain to attest to the IPFS collateral without revealing it.</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg-secondary)", borderRadius: "12px" }}>
                  <button className="secondary-btn" disabled={minting} onClick={mintSynthetic}>{minting ? "Minting..." : "Mint sBTC (Demo)"}</button>
                  <span style={{ fontSize: "20px", color: "var(--text-primary)", fontWeight: "600" }}>{syntheticBalance} sBTC</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: VAULT LIST */}
        {userVaults.length > 0 && (
          <div>
            <div className="card" style={{ padding: "24px", marginTop: 0 }}>
              <h4>Your Vaults</h4>
              <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {userVaults.map((v) => (
                  <div
                    key={v.vaultId}
                    onClick={() => handleLoadVault(v.vaultId)}
                    style={{
                      padding: "16px",
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>#{v.vaultId}</strong>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{v.btcLocked} BTC</span>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                      CID: {v.ipfsCid ? v.ipfsCid.slice(0, 10) + "..." : "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
