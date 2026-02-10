import { useState } from "react";
import Landing from "./pages/Landing";
import Vault from "./pages/Vault";
import Dashboard from "./pages/Dashboard";
import { connectWallet } from "./utils/starknet";
import "./styles.css";

export default function App() {
  const [account, setAccount] = useState(null);
  const [page, setPage] = useState("landing");

  async function handleConnect() {
    const wallet = await connectWallet();
    if (wallet) setAccount(wallet.account);
  }

  return (
    <div className="container">
<nav
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "25px",
    borderRadius:"7px"
  }}
>
  {/* Brand */}
  <div
    style={{
      fontWeight: "bold",
      letterSpacing: "0.6px",
      fontSize: "18px",
    }}
  >
    ShadowNet
  </div>

  {/* Navigation */}
  <div>
    <button
      onClick={() => setPage("vault")}
      style={{
        opacity: page === "vault" ? 1 : 0.6,
        marginRight: "10px",
        borderRadius:"4px"
      }}
    >
      Create Vault
    </button>

    <button
      onClick={() => setPage("dashboard")}
      style={{
        opacity: page === "dashboard" ? 1 : 0.6,
        borderRadius:"4px"
      }}
    >
      Dashboard
    </button>
  </div>

  {/* Wallet Button */}
  <div>
    {account ? (
      <button
        style={{
          background: "#1f2430",
          fontSize: "12px",
          cursor: "default",
          borderRadius:"4px"
        }}
      >
        {account.address.slice(0, 6)}...
        {account.address.slice(-4)}
      </button>
    ) : (
      <button onClick={handleConnect}>
        Connect Wallet
      </button>
    )}
  </div>
</nav>



      {page === "landing" && <Landing account={account} />}
      {page === "vault" && <Vault account={account} />}
      {page === "dashboard" && <Dashboard />}
    </div>
  );
}
