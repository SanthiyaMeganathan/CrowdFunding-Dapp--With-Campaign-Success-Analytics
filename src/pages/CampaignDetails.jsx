// src/pages/CampaignDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import CampaignCard from "../components/CampaignCard";
import DonateModal from "../components/DonateModal";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../context/WalletContext";

export default function CampaignDetails() {
  const { id } = useParams();
  const { getCampaign, getDonors, getDonationOf, getCampaignAnalytics, donate, contract } =
    useContract();
  const { account, provider } = useWallet();

  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [donors, setDonors] = useState([]);
  const [donationAmount, setDonationAmount] = useState("");
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");

        const campaignId = Number(id);
        if (isNaN(campaignId)) {
          setError("Invalid campaign ID.");
          return;
        }

        // ✅ Fetch campaign
        const c = await getCampaign(campaignId);
        setCampaign(c);

        // ✅ If deleted/closed → skip donors
        if (c.closed || !c.owner) {
          setLoading(false);
          return;
        }

        // ✅ Fetch analytics
        const stats = await getCampaignAnalytics(campaignId);
        setAnalytics(stats);

        // ✅ Fetch donors
        const donorAddresses = await getDonors(campaignId);
        if (donorAddresses && donorAddresses.length > 0) {
          const donorData = await Promise.all(
            donorAddresses.map(async (addr) => {
              let ensName = null;
              try {
                ensName = await provider.lookupAddress(addr);
              } catch {
                ensName = null;
              }

              const amountWei = await getDonationOf(campaignId, addr);
              const amountEth = ethers.formatEther(amountWei);

              return {
                address: addr,
                ens: ensName,
                amount: amountEth,
              };
            })
          );

          setDonors(donorData);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load campaign details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id, getCampaign, getDonors, getDonationOf, getCampaignAnalytics, contract, provider]);

  const handleDonate = async () => {
    if (!donationAmount || isNaN(donationAmount)) {
      alert("Enter a valid donation amount");
      return;
    }
    try {
      const tx = await donate(id, ethers.parseEther(donationAmount));
      await tx.wait();
      alert(`✅ Donated ${donationAmount} ETH successfully`);
      window.location.reload(); // refresh campaign state
    } catch (err) {
      console.error("Donate failed:", err);
      alert("❌ Donation failed. Please try again.");
    }
  };

  if (loading) return <p>Loading campaign details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!campaign) return <p>Campaign not found.</p>;

  // 🚨 Closed or deleted
  if (campaign.closed || !campaign.owner) {
    return (
      <div style={{ maxWidth: 980 }}>
        <h2>Campaign Details</h2>
        <CampaignCard campaign={campaign} />
        <p style={{ color: "red", fontWeight: "bold" }}>
          This campaign has been {campaign.closed ? "closed" : "deleted"} — cannot donate.
        </p>
      </div>
    );
  }

  // ✅ Compute success rate
  const raisedEth = parseFloat(ethers.formatEther(campaign.amountRaised));
  const targetEth = parseFloat(ethers.formatEther(campaign.target));
  const successRate =
    targetEth > 0 ? ((raisedEth / targetEth) * 100).toFixed(2) : "0.00";

  const remainingEth = analytics
    ? ethers.formatEther(analytics.remaining)
    : (targetEth - raisedEth).toFixed(4);

  return (
    <div style={{ maxWidth: 980 }}>
      <h2>Campaign Details</h2>
      <CampaignCard
        campaign={campaign}
        onDonateClick={() => setDonateModalOpen(true)}
      />

      {donateModalOpen && (
        <DonateModal
          campaign={campaign}
          onClose={() => setDonateModalOpen(false)}
          onSuccess={() => {
            setDonateModalOpen(false);
            window.location.reload();
          }}
        />
      )}

      <section style={{ marginTop: 20 }}>
        <h3>Contributions</h3>
        {donors.length === 0 ? (
          <p>No contributions yet.</p>
        ) : (
          <ul>
            {donors.map((d, idx) => (
              <li key={idx}>
                <strong>{d.ens ? d.ens : d.address}</strong> donated {d.amount} ETH
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Analytics</h3>
        <p>Success rate: {successRate}%</p>
        <p>Raised: {raisedEth} / {targetEth} ETH</p>
        <p>Remaining: {remainingEth} ETH</p>
        <p>Repayable: {campaign.repayable ? "Yes" : "No"}</p>
        {campaign.repayable && (
          <p>
            Repayment Date:{" "}
            {new Date(Number(campaign.repayAt) * 1000).toLocaleString()}
          </p>
        )}
      </section>

      {/* ✅ Donate Button */}
      {!campaign.closed && parseFloat(remainingEth) > 0 ? (
        <section style={{ marginTop: 20 }}>
          <h3>Donate</h3>
          {account ? (
            <div>
              <input
                type="number"
                step="0.01"
                placeholder="Enter ETH amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                style={{ marginRight: 8, padding: "6px" }}
              />
              <button
                onClick={handleDonate}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Donate
              </button>
            </div>
          ) : (
            <p>Please connect your wallet to donate.</p>
          )}
        </section>
      ) : (
        <p style={{ color: "red", marginTop: 20 }}>
          Campaign closed — cannot donate.
        </p>
      )}
    </div>
  );
}
