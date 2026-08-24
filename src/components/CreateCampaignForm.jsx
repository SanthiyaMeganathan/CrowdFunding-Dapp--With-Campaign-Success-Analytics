// src/components/CreateCampaignForm.jsx
import React, { useState } from "react";
import { useContract } from "../hooks/useContract";
import { ethers } from "ethers";
import "../styles/form.css";

const CreateCampaignForm = () => {
  const { createCampaign } = useContract();

  const [idea, setIdea] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reward, setReward] = useState(""); // reward short title
  const [rewardInfo, setRewardInfo] = useState(""); // detailed reward info
  const [refundInfo, setRefundInfo] = useState(""); // refund policy/info
  const [repaymentDate, setRepaymentDate] = useState("");
  const [repayable, setRepayable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!idea || !targetAmount || !deadline) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      const targetInWei = ethers.parseEther(targetAmount);
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      const repaymentTimestamp =
        repayable && repaymentDate
          ? Math.floor(new Date(repaymentDate).getTime() / 1000)
          : 0;

      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        setError("Deadline must be in the future.");
        return;
      }

      if (repayable && repaymentTimestamp <= deadlineTimestamp) {
        setError("Repayment date must be after the deadline.");
        return;
      }

      setLoading(true);

      const tx = await createCampaign(
        idea, // string coreIdea
        targetInWei, // uint target
        deadlineTimestamp, // uint deadline
        reward, // string reward
        repaymentTimestamp, // uint repayAt
        repayable, // bool repayable
        rewardInfo, // string rewardInfo
        refundInfo // string refundInfo
      );

      await tx.wait();

      setSuccessMsg("✅ Campaign created successfully!");
      setIdea("");
      setTargetAmount("");
      setDeadline("");
      setReward("");
      setRewardInfo("");
      setRefundInfo("");
      setRepaymentDate("");
      setRepayable(false);
    } catch (err) {
      console.error(err);
      setError("Transaction failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-form-shell">
      <p className="page-kicker">// publish to sepolia</p>
      <h2>Define your campaign.</h2>
      <form
        onSubmit={handleSubmit}
        className="campaign-form"
      >
        <label>
          Core Idea / Description:
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your campaign"
            required
          />
        </label>

        <label>
          Target Amount (ETH):
          <input
            type="number"
            step="0.01"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Deadline:
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </label>

        <label>
          Reward (short description):
          <input
            type="text"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="Ex: 5% cashback, NFT, badge..."
          />
        </label>

        <label>
          Reward Info (detailed):
          <textarea
            value={rewardInfo}
            onChange={(e) => setRewardInfo(e.target.value)}
            placeholder="Explain how donors will get their rewards"
          />
        </label>

        <label>
          Refund Info (policy/details):
          <textarea
            value={refundInfo}
            onChange={(e) => setRefundInfo(e.target.value)}
            placeholder="Explain refund policy and how donors can claim"
          />
        </label>

        <label>
          Repayable Campaign?
          <input
            type="checkbox"
            checked={repayable}
            onChange={(e) => setRepayable(e.target.checked)}
          />
        </label>

        {repayable && (
          <label>
            Repayment Timeline:
            <input
              type="datetime-local"
              value={repaymentDate}
              onChange={(e) => setRepaymentDate(e.target.value)}
              required
            />
          </label>
        )}

        {error && <p className="state-failure">{error}</p>}
        {successMsg && <p className="state-success">{successMsg}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
};

export default CreateCampaignForm;
