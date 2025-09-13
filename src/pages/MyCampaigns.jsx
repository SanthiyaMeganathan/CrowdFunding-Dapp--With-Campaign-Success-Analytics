// src/pages/MyCampaigns.jsx
import React, { useState, useEffect } from "react";
import CampaignCard from "../components/CampaignCard";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../context/WalletContext";
import { ethers } from "ethers";

export default function MyCampaigns() {
  const { account } = useWallet();
  const { getMyCampaigns, deleteCampaign, withdraw } = useContract();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});
  const [withdrawing, setWithdrawing] = useState({});
  const [message, setMessage] = useState("");

  const fetchMyCampaigns = async () => {
    if (!account) return;
    setLoading(true);
    try {
      const mine = await getMyCampaigns(account);
      setCampaigns(mine);
    } catch (err) {
      console.error("Error fetching my campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCampaigns();
  }, [account, getMyCampaigns]);

  const handleDelete = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;

    setDeleting((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const tx = await deleteCampaign(campaignId);
      await tx.wait();
      await fetchMyCampaigns();
      setMessage("✅ Campaign deleted and refunds processed.");
    } catch (err) {
      console.error("Error deleting campaign:", err);
      alert("Failed to delete campaign. It may have already been deleted.");
    } finally {
      setDeleting((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleWithdraw = async (campaign) => {
    setWithdrawing((prev) => ({ ...prev, [campaign.id]: true }));
    try {
      const tx = await withdraw(campaign.id);
      await tx.wait();
      const ethAmount = ethers.formatEther(campaign.amountRaised || "0");
      setMessage(`💸 Withdrawn ${ethAmount} ETH to your wallet.`);
      await fetchMyCampaigns();
    } catch (err) {
      console.error("Error withdrawing funds:", err);
      alert("Failed to withdraw funds. Make sure the deadline has passed or target met.");
    } finally {
      setWithdrawing((prev) => ({ ...prev, [campaign.id]: false }));
    }
  };

  const canWithdraw = (campaign) => {
    if (!campaign) return false;
    if (campaign.withdrawn) return false;
    const now = Math.floor(Date.now() / 1000);
    const deadlinePassed = now >= Number(campaign.deadline);
    const targetReached =
      BigInt(campaign.amountRaised) >= BigInt(campaign.target);
    return deadlinePassed || targetReached;
  };

  return (
    <div style={{ maxWidth: 980 }}>
      <h2>My Campaigns</h2>

      {message && (
        <p style={{ color: "green", marginBottom: 12, fontWeight: "bold" }}>
          {message}
        </p>
      )}

      {!account ? (
        <p>Please connect your wallet.</p>
      ) : loading ? (
        <p>Loading your campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p>You haven’t created any campaigns yet.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {campaigns.map((c, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 20,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
            >
              <CampaignCard campaign={c} />

              {/* Reward & Refund info (optional) */}
              {(c.rewardInfo || c.refundInfo) && (
                <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
                  {c.rewardInfo && (
                    <p>
                      🎁 <strong>Reward Info:</strong> {c.rewardInfo}
                    </p>
                  )}
                  {c.refundInfo && (
                    <p>
                      💡 <strong>Refund Info:</strong> {c.refundInfo}
                    </p>
                  )}
                </div>
              )}

              {/* Withdraw button (only owner) */}
              {c.owner?.toLowerCase() === account?.toLowerCase() && (
                <button
                  onClick={() => handleWithdraw(c)}
                  disabled={!canWithdraw(c) || withdrawing[c.id]}
                  style={{
                    marginTop: 8,
                    marginRight: 8,
                    padding: "6px 12px",
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor:
                      !canWithdraw(c) || withdrawing[c.id]
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {withdrawing[c.id]
                    ? "Withdrawing..."
                    : c.withdrawn
                    ? "Already Withdrawn"
                    : "Withdraw"}
                </button>
              )}

              {/* Delete button (only owner) */}
              {c.owner?.toLowerCase() === account?.toLowerCase() && (
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deleting[c.id]}
                  style={{
                    marginTop: 8,
                    padding: "6px 12px",
                    backgroundColor: "#ff4d4f",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    cursor: deleting[c.id] ? "not-allowed" : "pointer",
                  }}
                >
                  {deleting[c.id] ? "Deleting..." : "Delete Campaign"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
