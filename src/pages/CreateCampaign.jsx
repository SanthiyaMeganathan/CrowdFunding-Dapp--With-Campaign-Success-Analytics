// src/pages/CreateCampaign.jsx
import React from "react";
import { useWallet } from "../context/WalletContext"; // ✅ use the hook
import CreateCampaignForm from "../components/CreateCampaignForm";

export default function CreateCampaign() {
  const { account, connectWallet } = useWallet();

  // If wallet is not connected, show a message + button to connect
  if (!account) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Please connect your MetaMask wallet to create a campaign.</h2>
        <button
          onClick={connectWallet}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  // If wallet is connected, show the form
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Create a New Campaign</h1>
      <CreateCampaignForm />
    </div>
  );
}

