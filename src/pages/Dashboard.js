import { useState, useEffect } from "react";
import { getVault } from "../utils/starknet";

export default function Dashboard() {
  const [vaultId, setVaultId] = useState("");
  const [vault, setVault] = useState(null);
  const [status, setStatus] = useState("");

  const [minting, setMinting] = useState(false);
  const [mintStatus, setMintStatus] = useState("");
  const [syntheticBalance, setSyntheticBalance] = useState(0);
  const [btcLocked, setBtcLocked] = useState(0);

  const [userVaults, setUserVaults] = useState([]);

  // load persisted balances + vault list
  useEffect(() => {
    const bal = localStorage.getItem("syntheticBalance");
    if (bal) setSyntheticBalance(Number(bal));

    const account = window.starknet?.account;
    if (!account) return;

    const key = `shadownet_vaults_${account.address}`;
    const storedVaults =
      JSON.parse(localStorage.getItem(key)) || [];

    setUserVaults(storedVaults);
  }, []);

  async function handleLoadVault(idOverride) {
    const id = idOverride || vaultId;

    if (!id) {
      setStatus("Enter a vault ID");
      return;
    }

    setStatus("Querying Starknet...");
    setVault(null);

    try {
      const result = await getVault(id);

setVault({
  id,
  owner: result.owner
    ? result.owner.toString()
    : "0x0",
  commitment: result.commitment
    ? result.commitment.toString()
    : "0",
});


      const btc = localStorage.getItem(`vault_btc_${id}`);
      if (btc) setBtcLocked(Number(btc));

      setStatus("Vault loaded");
    } catch (err) {
      console.error(err);
      setStatus("Vault not found");
    }
  }

  function mintSynthetic() {
    setMinting(true);
    setMintStatus("Minting synthetic asset...");

    setTimeout(() => {
      const newBal = syntheticBalance + 1;
      setSyntheticBalance(newBal);
      localStorage.setItem("syntheticBalance", newBal);

      setMintStatus("✅ Synthetic asset minted (demo)");
      setMinting(false);
    }, 1200);
  }

  return (
    <div className="card">
      <h2>Vault Control Panel</h2>
      <p style={{ opacity: 0.7 }}>
        Privacy-first vault management on Starknet
      </p>

      {/* Top Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "20px",
          padding: "12px",
        }}
      >
        <div className="panel">
          <h4>Privacy Status</h4>
          <p>
            Private Mode
            <br />
            Vault state hidden behind cryptographic
            commitments
          </p>
        </div>

        <div className="panel">
          <h4>Synthetic Balance</h4>
          <p>
            <strong>{syntheticBalance}</strong> sBTC
          </p>
          <p style={{ fontSize: "12px", opacity: 0.6 }}>
            Demo balance · persisted locally
          </p>
        </div>
      </div>

      {/* Vault Lookup */}
      <div className="panel" style={{ marginTop: "15px" }}>
        <h4>Load Vault</h4>
        <input
          placeholder="Vault ID"
          value={vaultId}
          onChange={(e) => setVaultId(e.target.value)}
        />
        <button onClick={() => handleLoadVault()}>
          Fetch Vault
        </button>
        <p style={{ fontSize: "12px", opacity: 0.6 }}>
          {status}
        </p>
      </div>

      {/* Vault Details */}
      {vault && (
        <>
          <div className="panel" style={{ marginTop: "15px" }}>
            <h4>Commitment</h4>
            <code
              style={{
                fontSize: "12px",
                wordBreak: "break-all",
              }}
            >
              {vault.commitment}
            </code>
            <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "6px" }}>
  Commitment = H(collateral, nonce)
</p>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginTop: "15px",
            }}
          >
            <div className="panel">
              <h4>BTC Locked</h4>
              <p>
                <strong>{btcLocked}</strong> BTC
              </p>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                Simulated collateral
              </p>
            </div>

            <div className="panel">
              <h4>Actions</h4>
              <button
                disabled={minting}
                onClick={mintSynthetic}
              >
                {minting
                  ? "Minting..."
                  : "Mint Synthetic Asset"}
              </button>
              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                {mintStatus ||
                  "Minting is mocked in this demo"}
              </p>
            </div>
          </div>
        </>
      )}

      {/* === USER VAULTS LIST === */}
      {userVaults.length > 0 && (
        <div className="panel" style={{ marginTop: "20px" }}>
          <h4>Your Vaults</h4>

          {userVaults.map((v) => (
            <div
              key={v.vaultId}
              onClick={() =>
                handleLoadVault(v.vaultId)
              }
              style={{
                padding: "10px",
                borderBottom: "1px solid #222",
                cursor: "pointer",
              }}
            >
              <strong>Vault #{v.vaultId}</strong>
              <br />
              <span
                style={{
                  fontSize: "12px",
                  opacity: 0.6,
                }}
              >
                BTC: {v.btcLocked} · Commitment:{" "}
                {v.commitment.slice(0, 12)}...
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
