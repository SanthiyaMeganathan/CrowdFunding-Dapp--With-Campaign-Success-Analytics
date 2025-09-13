// src/components/DonateModal.jsx
import React, { useState, useMemo } from "react";
import { ethers } from "ethers";
import { useContract } from "../hooks/useContract";

export default function DonateModal({ campaign, onClose, onSuccess }) {
  const { donate } = useContract();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!campaign) return null;

  // ========== Compute Remaining ==========
  const remainingWei = useMemo(() => {
    try {
      return BigInt(campaign.target || "0") - BigInt(campaign.amountRaised || "0");
    } catch {
      return 0n;
    }
  }, [campaign]);

  const remainingEth = useMemo(() => {
    try {
      return ethers.formatEther(remainingWei < 0n ? 0n : remainingWei);
    } catch {
      return "0";
    }
  }, [remainingWei]);

  // ========== Handle Donation ==========
  const handleDonate = async () => {
    if (!amount || isNaN(amount)) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      const valueInWei = ethers.parseEther(amount);

      if (valueInWei <= 0n) {
        setError("Amount must be greater than 0.");
        return;
      }

      if (valueInWei > remainingWei) {
        setError(`You can only donate up to ${remainingEth} ETH (remaining needed).`);
        return;
      }

      setLoading(true);
      setError("");

      // ✅ Call donate via useContract helper
      await donate(campaign.id, valueInWei);

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          minWidth: 320,
          maxWidth: 420,
        }}
      >
        <h3>Donate to {campaign.idea || campaign.title || `Campaign #${campaign.id}`}</h3>
        <p>
          Target: {ethers.formatEther(campaign.target || "0")} ETH
          <br />
          Raised: {ethers.formatEther(campaign.amountRaised || "0")} ETH
          <br />
          Remaining: {remainingEth} ETH
        </p>

        <div style={{ marginTop: 12 }}>
          <input
            type="number"
            placeholder={`Enter amount in ETH (max ${remainingEth})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />
        </div>

        {error && (
          <p style={{ color: "red", marginTop: 8, fontSize: "0.9rem" }}>
            {error}
          </p>
        )}

        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            onClick={handleDonate}
            disabled={loading || remainingWei === 0n}
            style={{
              background: "#4caf50",
              color: "white",
              padding: "8px 16px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading ? "Processing..." : "Donate"}
          </button>
        </div>
      </div>
    </div>
  );
}
