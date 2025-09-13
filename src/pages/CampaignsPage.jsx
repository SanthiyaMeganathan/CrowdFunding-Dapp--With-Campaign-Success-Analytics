import React, { useState, useEffect } from "react";
import CampaignCard from "../components/CampaignCard";
import DonateModal from "../components/DonateModal";
import { useContract } from "../hooks/useContract";

export default function CampaignsPage() {
  const { getAllCampaigns } = useContract();
  const [campaigns, setCampaigns] = useState([]);
  const [donateTo, setDonateTo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const all = await getAllCampaigns();
      setCampaigns(all);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [getAllCampaigns]);

  return (
    <div style={{ maxWidth: 980 }}>
      <h2>All Campaigns</h2>

      {loading ? (
        <p>Loading campaigns...</p>
      ) : campaigns.length === 0 ? (
        <p>No campaigns found.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {campaigns.map((c, idx) => (
            <CampaignCard
              key={idx}
              campaign={c}
              onDonateClick={(camp) => setDonateTo(camp)}
            />
          ))}
        </div>
      )}

      {donateTo && (
        <DonateModal
          campaign={donateTo}
          onClose={() => setDonateTo(null)}
          onSuccess={() => {
            setDonateTo(null);
            fetchCampaigns(); // refresh campaigns after donation
          }}
        />
      )}
    </div>
  );
}
