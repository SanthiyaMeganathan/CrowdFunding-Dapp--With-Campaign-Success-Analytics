// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "../styles/navbar.css";

export default function Navbar() {
  const { account, chainId, connectWallet, disconnect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [accountName, setAccountName] = useState("Unnamed");
  const [editingName, setEditingName] = useState(false);
  const [copied, setCopied] = useState(false);

  const SEPOLIA_CHAIN_ID = 11155111; // Sepolia

  // 🔹 Load account name from localStorage whenever account changes
  useEffect(() => {
    if (!account) return;
    const savedName = localStorage.getItem(`account-name-${account}`);
    if (savedName) {
      setAccountName(savedName);
    } else {
      setAccountName("Account 1");
      localStorage.setItem(`account-name-${account}`, "Account 1");
    }
  }, [account]);

  const saveAccountName = (name) => {
    if (!account) return;
    setAccountName(name);
    localStorage.setItem(`account-name-${account}`, name);
    setEditingName(false);
  };

  // ✅ Updated handleConnect with pre-confirmation
  const handleConnect = async () => {
    if (loading) return;
    const confirmed = window.confirm(
      "Notification: Connect to Sepolia ETH network. Click OK to proceed."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      if (chainId && Number(chainId) !== SEPOLIA_CHAIN_ID) {
        alert("Notification: Connect to Sepolia ETH network only!!!");
        return;
      }
      await connectWallet();
    } catch (e) {
      if (e.code === "ACTION_REJECTED" || e.code === 4001) {
        alert("You rejected the connection request in MetaMask.");
      } else {
        alert("Something went wrong while connecting. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Updated handleChangeAccount with pre-confirmation
  const handleChangeAccount = async () => {
    if (loading) return;
    const confirmed = window.confirm(
      "Notification: Connect to Sepolia ETH network. Click OK to proceed with account change."
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      if (chainId && Number(chainId) !== SEPOLIA_CHAIN_ID) {
        alert("Notification: Connect to Sepolia ETH network only!!!");
        return;
      }
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      await connectWallet();
    } catch (e) {
      if (e.code === 4001) {
        alert("You rejected the account change request in MetaMask.");
      } else if (e.code === -32002) {
        alert("A MetaMask request is already pending. Please open MetaMask and complete it first.");
      } else {
        alert("Something went wrong while changing account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    alert("You are not connected to any account.");
    setDropdownOpen(false);
  };

  const handleCopy = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy address.");
    }
  };

  const shortAddr = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : null;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="brand">CrowdFund</div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Home
          </NavLink>
          <NavLink
            to="/campaigns"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Campaigns
          </NavLink>
          <NavLink
            to="/my-campaigns"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            My Campaigns
          </NavLink>
          <NavLink
            to="/my-donations"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            My Donations
          </NavLink>
        </div>
      </div>

      <div className="nav-right">
        {account ? (
          <div
            className="wallet-dropdown"
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="btn-connect"
              onClick={() => setDropdownOpen((prev) => !prev)}
              disabled={loading}
            >
              {loading ? "Please wait..." : "Connected"}
            </button>

            {dropdownOpen && (
              <div className="wallet-menu">
                <p>
                  <strong>Account:</strong>{" "}
                  {editingName ? (
                    <>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        onBlur={() => saveAccountName(accountName)}
                        autoFocus
                      />
                      <button onClick={() => saveAccountName(accountName)}>Save</button>
                    </>
                  ) : (
                    <>
                      {accountName}{" "}
                      <button
                        onClick={() => setEditingName(true)}
                        className="edit-btn"
                        title="Edit name"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </p>
                <p
                  className="address"
                  onClick={handleCopy}
                  title={copied ? "Copied!" : "Click to copy"}
                  style={{ cursor: "pointer" }}
                >
                  <strong>Address:</strong> {shortAddr}
                  {copied && <span style={{ marginLeft: "8px", color: "green" }}>✔ Copied!</span>}
                </p>
                <button className="btn-connect" onClick={handleChangeAccount} disabled={loading}>
                  Change Account
                </button>
                <button className="btn-disconnect" onClick={handleDisconnect} disabled={loading}>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-connect" onClick={handleConnect} disabled={loading}>
            {loading ? "Please wait..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </nav>
  );
}
