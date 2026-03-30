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
      <nav>
        {/* Brand */}
        <div className="brand" onClick={() => setPage("landing")}>
          ShadowNet
        </div>

        {/* Navigation Wrapper */}
        <div className="nav-links">
          <button
            className={`nav-link ${page === "vault" ? "active" : ""}`}
            onClick={() => setPage("vault")}
          >
            Vault
          </button>

          <button
            className={`nav-link ${page === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            Dashboard
          </button>
        </div>

        {/* Wallet Button */}
        <div>
          {account ? (
            <button className="wallet-btn" style={{ cursor: "default" }}>
              {account.address.slice(0, 6)}...
              {account.address.slice(-4)}
            </button>
          ) : (
            <button className="wallet-btn" onClick={handleConnect}>
              Connect
            </button>
          )}
        </div>
      </nav>

      <main>
        {page === "landing" && <Landing account={account} />}
        {page === "vault" && <Vault account={account} />}
        {page === "dashboard" && <Dashboard />}
      </main>
    </div>
  );
}
