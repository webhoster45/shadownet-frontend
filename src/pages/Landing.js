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
        Confidential BTC-backed vaults for Starknet BTCFi
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
          BTCFi lending protocols today expose collateral amounts,
          debt positions, and liquidation thresholds publicly.
        </p>

        <p>
          ShadowNet introduces a vault primitive where BTC-backed
          borrowing can exist without revealing sensitive vault state
          on-chain.
        </p>

        <p>
          Instead of storing balances, ShadowNet stores only a single
          cryptographic commitment hash — representing the vault’s
          private financial position.
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
          <li>BTC collateral enters Starknet via a bridge (mocked)</li>
          <li>Collateral + debt state are encoded into a commitment</li>
          <li>Only the commitment hash is stored publicly on-chain</li>
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
  <strong>🔐 ZK Upgrade Path</strong>
  <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
ShadowNet is built around a commitment-based vault model:
          Starknet verifies vault existence without learning the
          collateral amount, debt ratio, or liquidation boundary.
  </p>

  <p style={{ marginTop: "8px", lineHeight: "1.6" }}>
In a production-grade BTCFi system:
  </p>

  <ul style={{ paddingLeft: "18px", marginTop: "6px" }}>
 <li>Users generate a solvency proof off-chain</li>
          <li>The proof attests the vault is safely collateralized</li>
          <li>Starknet verifies it without revealing private values</li>
  </ul>

  <p style={{ marginTop: "8px", opacity: 0.8 }}>
    This prototype ships the base vault commitment layer.
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
        • Vault commitment storage:{" "} <span style={{ color: "#7CFF7C" }}>Live on Starknet Sepolia</span>
        <br />
        • BTC bridge: Mocked for demo flow
        <br />
        • Synthetic minting: Mocked UX prototype
        <br />
        • Next step: ZK solvency verification

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
Connect your Starknet wallet to open a BTC-backed vault.
        </p>
      )}
    </div>
  );
}
