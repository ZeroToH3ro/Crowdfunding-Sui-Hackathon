/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { claimFundsTransaction } from '../../services/contractService';

export default function ClaimForm({
  wallet,
  campaignId,
  showMessage,
  setLoading,
  loading,
  fetchCampaignDetails,
  campaignClaimed
}) {
  const [creatorCapId, setCreatorCapId] = useState('');

  const handleClaimFunds = async () => {
    if (!wallet.connected) {
      showMessage("Please connect your wallet first.", true);
      return;
    }
    if (!campaignId || !creatorCapId) {
      showMessage("Please provide Campaign ID and Creator Cap ID.", true);
      return;
    }

    setLoading(true);

    try {
      const txb = await claimFundsTransaction(campaignId, creatorCapId);

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      showMessage(`Claim funds transaction submitted! Digest: ${result.digest}`);
      fetchCampaignDetails(campaignId);
    } catch (err) {
      console.error("Claim funds failed:", err);
      showMessage(`Failed to claim funds: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-600">Claim Funds (Creator)</h3>
      <label htmlFor="creatorCapId" className="block text-sm font-medium text-gray-600 mb-1">Creator Cap Object ID:</label>
      <input
        type="text"
        id="creatorCapId"
        value={creatorCapId}
        onChange={(e) => setCreatorCapId(e.target.value)}
        placeholder="Enter your CreatorCap Object ID"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
      />
      <button
        onClick={handleClaimFunds}
        disabled={!wallet.connected || loading || !campaignId || !creatorCapId || campaignClaimed}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {loading ? 'Claiming...' : 'Claim Funds'}
      </button>
      <p className="text-xs text-gray-500 mt-1">Only the campaign creator with the correct Creator Cap can claim after the deadline if the goal is met.</p>
    </div>
  );
}