export default function Landing({ account }) {
  return (
    <div className="card">
      <h1 style={{ letterSpacing: "0.6px" }}>
        ShadowNet
      </h1>

      <p
        style={{
          fontSize: "15px",
          opacity: 0.9,
          marginTop: "8px",
        }}
      >
        Privacy-first collateralized vaults on Starknet
      </p>

      {/* === CORE DESCRIPTION === */}
      <div
        style={{
          marginTop: "18px",
          padding: "16px",
          background: "#111521",
          borderRadius: "8px",
          lineHeight: "1.65",
          fontSize: "14px",
          opacity: 0.92,
        }}
      >
<p>
  Most BTCFi protocols expose collateral amounts and liquidation
  thresholds. ShadowNet hides vault state by design using
  cryptographic commitments.
</p>

        <p>
          Instead of storing sensitive financial data, ShadowNet
          records a single cryptographic commitment hash —
          representing the vault’s private state.
        </p>

        <p>
          This approach enables private DeFi primitives while
          remaining verifiable and composable on Starknet.
        </p>
      </div>

      {/* === HOW IT WORKS === */}
      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          border: "1px solid #1c2033",
          borderRadius: "8px",
          fontSize: "13px",
          opacity: 0.85,
        }}
      >
        <strong>How ShadowNet works:</strong>
        <ul style={{ paddingLeft: "18px", marginTop: "8px" }}>
          <li>BTC collateral is locked via a bridge (mocked)</li>
          <li>Collateral & debt are encoded into a commitment</li>
          <li>Only the commitment hash is stored on Starknet</li>
          <li>Vault interactions reference commitments, not balances</li>
        </ul>
      </div>


      {/* === PROOF-READY ARCHITECTURE === */}
<div
  style={{
    marginTop: "16px",
    padding: "14px",
    border: "1px solid #1c2033",
    borderRadius: "8px",
    fontSize: "13px",
    opacity: 0.9,
  }}
>
  <strong>🔐 Proof-Ready Architecture</strong>
  <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
    ShadowNet stores only a cryptographic commitment on-chain.
    No collateral amounts, debt ratios, or liquidation thresholds
    are publicly revealed.
  </p>

  <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
    In a production system:
  </p>

  <ul style={{ paddingLeft: "18px", marginTop: "6px" }}>
    <li>Users generate a zero-knowledge proof off-chain</li>
    <li>The proof attests to solvency and collateralization</li>
    <li>Starknet verifies the proof without revealing vault state</li>
  </ul>

  <p style={{ marginTop: "8px", opacity: 0.8 }}>
    This prototype focuses on the base commitment layer.
  </p>
</div>


      {/* === STATUS === */}
      <div
        style={{
          marginTop: "16px",
          fontSize: "13px",
          opacity: 0.7,
        }}
      >
        <strong>Prototype status:</strong>
        <br />
        • Vault creation: <span style={{ color: "#7CFF7C" }}>Live on Starknet Sepolia</span>
        <br />
        • BTC collateral: Mocked
        <br />
        • Synthetic minting: Mocked (UX demo)
        <br />
        • Privacy layer: Conceptual / architecture demo
      </div>

      <hr style={{ margin: "22px 0", opacity: 0.2 }} />

      {/* === WALLET STATUS === */}
      {account ? (
        <div>
          <p
            style={{
              fontSize: "13px",
              opacity: 0.75,
              marginBottom: "6px",
            }}
          >
            Connected wallet
          </p>
          <code
            style={{
              fontSize: "12px",
              wordBreak: "break-all",
            }}
          >
            {account.address}
          </code>
        </div>
      ) : (
        <p style={{ opacity: 0.75 }}>
          Connect your Starknet wallet to create a private vault.
        </p>
      )}
    </div>
  );
}
