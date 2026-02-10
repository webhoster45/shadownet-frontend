import { useState, useEffect } from "react";
import { getVault } from "../utils/starknet";

function shorten(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export default function Dashboard() {
  const [vaultId, setVaultId] = useState("");
  const [vault, setVault] = useState(null);
  const [status, setStatus] = useState("");

  const [userVaults, setUserVaults] = useState([]);
    // === Synthetic Borrowing Demo ===
  const [syntheticBalance, setSyntheticBalance] = useState(0);
  const [minting, setMinting] = useState(false);


  // Load vault list for this wallet
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

    setStatus("Querying Starknet...");
    setVault(null);

    try {
      const result = await getVault(id);

      const commitmentRaw = result.commitment
        ? result.commitment.toString()
        : "0";

      setVault({
        id,
        owner: result.owner ? result.owner.toString() : "0x0",
        commitment: commitmentRaw,
        createdAt: Date.now(),
      });

      setStatus("Vault loaded successfully ✔️");
    } catch (err) {
      console.error(err);
      setStatus("Vault not found.");
    }
  }
    // === Mint Synthetic Asset (Prototype UX) ===
  function mintSynthetic() {
    setMinting(true);

    setTimeout(() => {
      const newBal = syntheticBalance + 1;
      setSyntheticBalance(newBal);
      setMinting(false);

      setStatus("✅ Minted 1 sBTC (prototype demo)");
    }, 1000);
  }


  function copyCommitment() {
    if (!vault?.commitment) return;
    navigator.clipboard.writeText(vault.commitment);
    setStatus("Commitment copied to clipboard ✔️");
  }

  return (
    <div className="card">
      {/* HEADER */}
      <h2 style={{ marginBottom: "4px" }}>
        Private Vault Dashboard
      </h2>

      <p style={{ opacity: 0.75, fontSize: "13px" }}>
        ShadowNet vaults store only cryptographic commitments on-chain.
        Collateral and debt remain confidential.
      </p>

      {/* VAULT LOOKUP */}
      <div className="panel" style={{ marginTop: "18px" }}>
        <h4>Load Vault</h4>

        <input
          placeholder="Enter Vault ID"
          value={vaultId}
          onChange={(e) => setVaultId(e.target.value)}
        />

        <button
          style={{ marginTop: "10px" }}
          onClick={() => handleLoadVault()}
        >
          Fetch Vault from Starknet
        </button>

        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          {status}
        </p>
      </div>

      {/* VAULT DETAILS */}
      {vault && (
        <>
          {/* METADATA CARD */}
          <div className="panel" style={{ marginTop: "18px" }}>
            <h4>Vault Overview</h4>

            <p style={{ margin: "6px 0" }}>
              <strong>Vault ID:</strong> #{vault.id}
            </p>

            <p style={{ margin: "6px 0" }}>
              <strong>Owner:</strong> {shorten(vault.owner)}
            </p>

            <p style={{ margin: "6px 0" }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#7CFF7C" }}>
                Active · Commitment Stored ✔️
              </span>
            </p>

            <p style={{ margin: "6px 0", fontSize: "12px", opacity: 0.7 }}>
              Network: Starknet Sepolia
            </p>
          </div>

          {/* COMMITMENT CARD */}
          <div className="panel" style={{ marginTop: "15px" }}>
            <h4>On-chain Commitment</h4>

            <code
              style={{
                display: "block",
                fontSize: "12px",
                wordBreak: "break-all",
                padding: "10px",
                borderRadius: "8px",
                background: "#111521",
              }}
            >
              {vault.commitment}
            </code>

            <p style={{ fontSize: "12px", opacity: 0.65, marginTop: "6px" }}>
              Commitment = H(collateral, debt, nonce)
            </p>

            <button
              style={{ marginTop: "10px" }}
              onClick={copyCommitment}
            >
              Copy Commitment
            </button>
          </div>
          {/* === Borrowing UX Demo === */}
          <div className="panel" style={{ marginTop: "15px" }}>
            <h4>Borrowing (Prototype)</h4>

            <p style={{ fontSize: "13px", opacity: 0.75 }}>
              Mint a synthetic BTC asset to demonstrate private borrowing UX.
            </p>

            <button disabled={minting} onClick={mintSynthetic}>
              {minting ? "Minting..." : "Mint sBTC (Demo)"}
            </button>

            <p style={{ marginTop: "10px", fontSize: "13px" }}>
              <strong>Your sBTC Balance:</strong> {syntheticBalance}
            </p>

            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              In production, minting requires a ZK solvency proof.
            </p>
          </div>

          {/* PROOF READY SECTION */}
          <div className="panel" style={{ marginTop: "15px" }}>
            <h4>🔐 Proof-Ready Layer</h4>

            <p style={{ fontSize: "13px", opacity: 0.8 }}>
              In production, users will generate a zero-knowledge proof
              attesting solvency without revealing vault balances.
            </p>

            <button disabled style={{ opacity: 0.5, marginTop: "10px" }}>
              Generate ZK Proof (Coming Soon)
            </button>
          </div>
        </>
      )}

      {/* USER VAULT LIST */}
      {userVaults.length > 0 && (
        <div className="panel" style={{ marginTop: "20px" }}>
          <h4>Your Vaults</h4>

          {userVaults.map((v) => (
            <div
              key={v.vaultId}
              onClick={() => handleLoadVault(v.vaultId)}
              style={{
                padding: "10px",
                borderBottom: "1px solid #222",
                cursor: "pointer",
              }}
            >
              <strong>Vault #{v.vaultId}</strong>
              <br />
              <span style={{ fontSize: "12px", opacity: 0.65 }}>
                Commitment: {v.commitment.slice(0, 14)}...
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
