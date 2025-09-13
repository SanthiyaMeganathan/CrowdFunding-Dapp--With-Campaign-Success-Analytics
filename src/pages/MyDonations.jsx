// src/pages/MyDonations.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { useContract } from "../hooks/useContract";
import CampaignCard from "../components/CampaignCard";

export default function MyDonations() {
  const { contract, getCampaign, getDonationOf } = useContract();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyDonations = async () => {
      try {
        setLoading(true);
        setError("");

        if (!window.ethereum) {
          setError("MetaMask not detected.");
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        const totalCampaigns = await contract.campaignCount();
        const myDonations = [];

        for (let i = 1; i <= Number(totalCampaigns); i++) {
          try {
            const amount = await contract.getDonationOf(i, userAddress);

            if (amount && amount > 0n) {
              const campaign = await getCampaign(i);

              myDonations.push({
                id: i,
                campaign,
                amount: ethers.formatEther(amount),
                userAddress,
              });
            }
          } catch (err) {
            // skip invalid campaign IDs
            continue;
          }
        }

        setDonations(myDonations);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch your donations.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyDonations();
  }, [contract, getCampaign, getDonationOf]);

  const handleHowToGet = async (d) => {
    try {
      const campaign = await getCampaign(d.id);

      // ✅ If campaign was deleted
      if (!campaign.owner || campaign.owner === "0x0000000000000000000000000000000000000000") {
        alert("Refund processed: check your wallet.");
        return;
      }

      // ✅ Check if refund already claimed (donation reset to 0)
      const stillDonated = await getDonationOf(d.id, d.userAddress);
      if (BigInt(stillDonated) === 0n) {
        alert("Refund already claimed and processed to your wallet.");
        return;
      }

      // ✅ Show reward/refund info
      const message = `
Reward info:
${campaign.rewardInfo || "No reward info provided"}

Refund info:
${campaign.refundInfo || "No refund info provided"}
      `;
      alert(message);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch reward/refund info.");
    }
  };

  if (loading) return <p>Loading your donations...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 980 }}>
      <h2>My Donations</h2>

      {donations.length === 0 ? (
        <p>You haven’t donated to any campaigns yet.</p>
      ) : (
        donations.map((d) => (
          <div
            key={d.id}
            style={{
              marginBottom: 20,
              padding: 15,
              border: "1px solid #ccc",
              borderRadius: 8,
              background: "#f9f9f9",
            }}
          >
            {/* Campaign Summary */}
            <CampaignCard campaign={d.campaign} />

            {/* User Donation Highlight */}
            <p
              style={{
                marginTop: 10,
                padding: "8px",
                background: "#e0ffe0",
                color: "#2d7a2d",
                fontWeight: "bold",
                borderRadius: 6,
              }}
            >
              ✅ You donated {d.amount} ETH
            </p>

            {/* Actions */}
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => handleHowToGet(d)}
                style={{
                  marginRight: 10,
                  padding: "6px 12px",
                  background: "#ffa500",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                How to get reward/refund?
              </button>

              <Link
                to={`/campaign/${d.id}`}
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  background: "#1976d2",
                  color: "white",
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                View Details
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
