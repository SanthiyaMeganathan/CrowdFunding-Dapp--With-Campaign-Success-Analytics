// src/components/CampaignCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import "../styles/campaignCard.css";

export default function CampaignCard({ campaign, onDonateClick }) {
  if (!campaign) {
    return <div className="campaign-card">Loading...</div>;
  }

  // ========== ETH Conversions ==========
  const goalEth = (() => {
    try {
      return ethers.formatEther(BigInt(campaign.target || "0"));
    } catch {
      return "0";
    }
  })();

  const pledgedEth = (() => {
    try {
      return ethers.formatEther(BigInt(campaign.amountRaised || "0"));
    } catch {
      return "0";
    }
  })();

  const remainingWei = (() => {
    try {
      return BigInt(campaign.target || "0") - BigInt(campaign.amountRaised || "0");
    } catch {
      return 0n;
    }
  })();

  const remainingEth = (() => {
    try {
      return ethers.formatEther(remainingWei < 0n ? 0n : remainingWei);
    } catch {
      return "0";
    }
  })();

  // ========== Deadline ==========
  const deadlineDate = campaign?.deadline
    ? new Date(Number(campaign.deadline) * 1000).toLocaleString()
    : "—";

  const isPastDeadline = campaign?.deadline
    ? Date.now() > Number(campaign.deadline) * 1000
    : false;

  // ========== Goal Reached ==========
  const isGoalReached = (() => {
    try {
      return BigInt(campaign.amountRaised || "0") >= BigInt(campaign.target || "0");
    } catch {
      return false;
    }
  })();

  // ========== Closed ==========
  const closed = campaign.closed || isGoalReached || isPastDeadline;

  return (
    <div className={`campaign-card ${closed ? "closed" : ""}`}>
      {/* Header */}
      <div className="card-header">
        <h3>{campaign.idea || `Campaign #${campaign.id}`}</h3>
        {closed && <span className="badge-closed">Closed</span>}
      </div>

      {/* Description */}
      <p className="card-desc">{campaign.reward || "No description"}</p>

      {/* Stats */}
      <div className="card-stats">
        <div><strong>Goal:</strong> {goalEth} ETH</div>
        <div><strong>Pledged:</strong> {pledgedEth} ETH</div>
        <div><strong>Remaining:</strong> {remainingEth} ETH</div>
        <div><strong>Deadline:</strong> {deadlineDate}</div>
      </div>

      {/* Remaining Limit */}
      {!closed && remainingWei > 0n && (
        <p className="remaining-msg">
          Only {remainingEth} ETH remaining — you can donate up to {remainingEth} ETH
        </p>
      )}

      {/* Actions */}
      <div className="card-actions">
        <button
          disabled={closed || remainingWei === 0n}
          onClick={() => onDonateClick?.(campaign, remainingEth)}
        >
          Donate
        </button>
        <Link to={`/campaign/${campaign.id || ""}`}>
          <button>Details</button>
        </Link>
      </div>
    </div>
  );
}
