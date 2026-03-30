export default function Landing({ account }) {
  return (
    <div className="glass-card fade-in">
      <h1>
        ShadowNet
      </h1>

      <p style={{ fontSize: "18px", color: "var(--text-primary)", marginTop: "8px", fontWeight: 500 }}>
        Confidential vault commitments for privacy-preserving DeFi on <span className="badge-starknet">Starknet</span>
      </p>

      {/* === CORE DESCRIPTION === */}
      <div className="panel" style={{ marginTop: "32px", background: "var(--bg-secondary)", border: "none" }}>
        <p>DeFi lending exposes collateral, debt, and liquidation risk to the entire world.</p>
        <p>ShadowNet introduces a vault primitive where BTC-backed borrowing can exist without revealing sensitive vault state on-chain.</p>
        <p>Instead of storing balances, ShadowNet stores encrypted data dynamically on <span className="badge-ipfs">IPFS</span> and verifies the commitment hash on <span className="badge-starknet">Starknet</span>.</p>
      </div>

      {/* === HOW IT WORKS === */}
      <div className="panel" style={{ marginTop: "16px", background: "var(--bg-secondary)", border: "none" }}>
        <h4>How ShadowNet works</h4>
        <ul style={{ paddingLeft: "18px", marginTop: "16px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          <li>Users create a vault, encrypting the collateral metadata.</li>
          <li>Encrypted data is pinned to <span className="badge-ipfs">IPFS</span>.</li>
          <li>The returned IPFS CID is hashed into a cryptographic commitment.</li>
          <li>Only the commitment hash is stored publicly on <span className="badge-starknet">Starknet</span>.</li>
        </ul>
      </div>

      {/* === PROOF-READY ARCHITECTURE === */}
      <div className="panel" style={{ marginTop: "16px", background: "var(--bg-secondary)", border: "none" }}>
        <h4>ZK Upgrade Path <span className="badge-zk">Future Extension</span></h4>
        <p style={{ marginTop: "12px", lineHeight: "1.6" }}>
          ShadowNet is built around a commitment-based vault model. In a production-grade system:
        </p>
        <ul style={{ paddingLeft: "18px", marginTop: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
          <li>Users execute a Solvency Proof off-chain.</li>
          <li>The proof attests the vault is safely collateralized.</li>
          <li>Starknet verifies it without revealing private values.</li>
        </ul>
      </div>

      {/* === WALLET STATUS === */}
      <div style={{ marginTop: "32px", textAlign: "center" }}>
        {account ? (
          <div>
            <p style={{ fontSize: "14px", color: "var(--text-primary)", marginBottom: "8px", fontWeight: 500 }}>
              Secure Connection Established
            </p>
            <code style={{ display: "inline-block", background: "transparent", border: "none" }}>{account.address}</code>
          </div>
        ) : (
          <p style={{ color: "var(--text-secondary)" }}>
            Connect your Starknet wallet to initialize a Confidential vault.
          </p>
        )}
      </div>
    </div>
  );
}
