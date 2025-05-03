/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { createCampaignTransaction } from '../../services/contractService';

export default function CampaignForm({ wallet, showMessage, setLoading, loading }) {
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignGoal, setCampaignGoal] = useState(0);
  const [campaignDeadlineEpochs, setCampaignDeadlineEpochs] = useState(0);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!wallet.connected) {
      showMessage("Please connect your wallet first.", true);
      return;
    }
    if (!campaignName || !campaignDesc || !campaignGoal || !campaignDeadlineEpochs) {
      showMessage("Please fill in all campaign details.", true);
      return;
    }

    setLoading(true);

    try {
      const goalAmount = BigInt(campaignGoal);
      const deadline = BigInt(campaignDeadlineEpochs);

      if (goalAmount <= 0 || deadline <= 0) {
        showMessage("Goal and Deadline Epochs must be positive numbers.", true);
        setLoading(false);
        return;
      }
      const txb = await createCampaignTransaction(
        campaignName,
        campaignDesc,
        goalAmount,
        deadline
      );
      txb.setGasBudget(10000000);
      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      showMessage(`Campaign creation transaction submitted! Digest: ${result.digest}`);
      // Clear form
      setCampaignName('');
      setCampaignDesc('');
      setCampaignGoal(0);
      setCampaignDeadlineEpochs(0);

    } catch (err) {
      console.error("Create campaign failed:", err);
      showMessage(`Failed to create campaign: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-blue-700">Create New Campaign</h2>
      <form onSubmit={handleCreateCampaign} className="space-y-4">
        <div>
          <label htmlFor="campaignName" className="block text-sm font-medium text-gray-600 mb-1">Campaign Name:</label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="My Awesome Project"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="campaignDesc" className="block text-sm font-medium text-gray-600 mb-1">Description:</label>
          <textarea
            id="campaignDesc"
            value={campaignDesc}
            onChange={(e) => setCampaignDesc(e.target.value)}
            placeholder="Briefly describe your campaign"
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="campaignGoal" className="block text-sm font-medium text-gray-600 mb-1">Goal (in MIST):</label>
          <input
            type="number"
            id="campaignGoal"
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value)}
            placeholder="e.g., 1000000000 (for 1 SUI)"
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">1 SUI = 1,000,000,000 MIST</p>
        </div>
        <div>
          <label htmlFor="campaignDeadline" className="block text-sm font-medium text-gray-600 mb-1">Duration (in Epochs):</label>
          <input
            type="number"
            id="campaignDeadline"
            value={campaignDeadlineEpochs}
            onChange={(e) => setCampaignDeadlineEpochs(e.target.value)}
            placeholder="Number of epochs from now"
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">The campaign will end this many epochs after creation.</p>
        </div>
        <button
          type="submit"
          disabled={!wallet.connected || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
        >
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </section>
  );
}