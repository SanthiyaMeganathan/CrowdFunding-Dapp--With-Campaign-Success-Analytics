// src/hooks/useContract.js
import { ethers } from "ethers";
import contractAbi from "../utils/abi.json";
import { CONTRACT_ADDRESS } from "../utils/config";
import { useWallet } from "../context/WalletContext";
import { useCallback, useMemo } from "react";

export function useContract() {
  const { signer } = useWallet();

  // ========== Provider & Contracts ==========
  const provider = useMemo(
    () => new ethers.BrowserProvider(window.ethereum || null),
    []
  );

  const readOnlyContract = useMemo(
    () => new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider),
    [provider]
  );

  const contract = useMemo(
    () =>
      signer
        ? new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer)
        : null,
    [signer]
  );

  // ========== Helpers ==========
  const parseId = (id) => {
    const num = Number(id);
    if (isNaN(num)) throw new Error(`Invalid campaign ID: ${id}`);
    return num;
  };

  const mapCampaign = (c) => ({
    id: c.id?.toString?.() || "0",
    owner: c.owner,
    idea: c.coreIdea || "",
    target: c.target?.toString?.() || "0",
    amountRaised: c.amountRaised?.toString?.() || "0",
    reward: c.reward || "",
    repayAt: c.repayAt?.toString?.() || "0",
    repayable: c.repayable,
    closed: c.closed,
    withdrawn: c.withdrawn,
    createdAt: c.createdAt?.toString?.() || "0",
    closedAt: c.closedAt?.toString?.() || "0",
    deadline: c.deadline?.toString?.() || "0",
    donorCount: c.donorCount?.toString?.() || "0",
    rewardInfo: c.rewardInfo || "",
    refundInfo: c.refundInfo || "",
  });

  // ========== Read Functions ==========
  const getCampaign = useCallback(
    async (id) => {
      const campaignId = parseId(id);
      const c = await (contract || readOnlyContract).getCampaign(campaignId);
      return mapCampaign(c);
    },
    [contract, readOnlyContract]
  );

  const getAllCampaigns = useCallback(
    async () => {
      const active = contract || readOnlyContract;
      const count = await active.campaignCount();
      const campaigns = [];
      for (let i = 1; i <= Number(count); i++) {
        try {
          const c = await active.getCampaign(i);
          const mapped = mapCampaign(c);

          // 🚨 Skip closed or invalid campaigns
          if (
            !mapped.owner ||
            mapped.owner === "0x0000000000000000000000000000000000000000"
          ) {
            continue;
          }

          campaigns.push(mapped);
        } catch {
          continue;
        }
      }
      return campaigns;
    },
    [contract, readOnlyContract]
  );

  const getMyCampaigns = useCallback(
    async (account) => {
      const all = await getAllCampaigns();
      return all.filter(
        (c) => c.owner && c.owner.toLowerCase() === account.toLowerCase()
      );
    },
    [getAllCampaigns]
  );

  const getCampaignAnalytics = useCallback(
    async (id) => {
      const campaignId = parseId(id);
      return await (contract || readOnlyContract).getCampaignAnalytics(campaignId);
    },
    [contract, readOnlyContract]
  );

  const getDonationOf = useCallback(
    async (id, donor) => {
      const campaignId = parseId(id);
      const res = await (contract || readOnlyContract).getDonationOf(campaignId, donor);
      return res.toString();
    },
    [contract, readOnlyContract]
  );

  const getDonors = useCallback(
    async (id) => {
      const campaignId = parseId(id);
      return await (contract || readOnlyContract).getDonors(campaignId);
    },
    [contract, readOnlyContract]
  );

  // ========== Write Functions ==========
  const createCampaign = useCallback(
    async (idea, target, deadline, reward, repayAt, repayable, rewardInfo, refundInfo) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.createCampaign(
        idea,
        target,
        deadline,
        reward,
        repayAt,
        repayable,
        rewardInfo,
        refundInfo
      );
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const donate = useCallback(
    async (campaignId, amount) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.donate(parseId(campaignId), { value: amount });
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const withdraw = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.withdraw(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const deleteCampaign = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.deleteCampaign(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const claimRefund = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.claimRefund(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const claimRepayment = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.claimRepayment(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const claimReward = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.claimReward(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const depositRepayment = useCallback(
    async (campaignId, amount) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.depositRepayment(parseId(campaignId), { value: amount });
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const closeCampaign = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.closeCampaign(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const checkAndDeleteExpired = useCallback(
    async (campaignId) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.checkAndDeleteExpired(parseId(campaignId));
      await tx.wait();
      return tx;
    },
    [contract]
  );

  const markRewardDelivered = useCallback(
    async (campaignId, donor) => {
      if (!contract) throw new Error("Wallet not connected");
      const tx = await contract.markRewardDelivered(parseId(campaignId), donor);
      await tx.wait();
      return tx;
    },
    [contract]
  );

  // ========== Export ==========
  return {
    // read
    getCampaign,
    getAllCampaigns,
    getMyCampaigns,
    getCampaignAnalytics,
    getDonationOf,
    getDonors,

    // write
    createCampaign,
    donate,
    withdraw,
    deleteCampaign,
    claimRefund,
    claimRepayment,
    claimReward,
    depositRepayment,
    closeCampaign,
    checkAndDeleteExpired,
    markRewardDelivered,

    // raw contract
    contract,
  };
}
