/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { donateTransaction } from '../../services/contractService';

export default function DonateForm({ 
  wallet, 
  campaignId, 
  showMessage, 
  setLoading, 
  loading, 
  fetchCampaignDetails,
  campaignClaimed 
}) {
  const [donationAmount, setDonationAmount] = useState(0);
  
  const handleDonate = async () => {
    if (!wallet.connected) {
      showMessage("Please connect your wallet first.", true);
      return;
    }
    if (!campaignId || !donationAmount) {
      showMessage("Please provide Campaign ID and Donation Amount.", true);
      return;
    }

    setLoading(true);

    try {
      const amountSui = BigInt(donationAmount);
      if (amountSui <= 0) {
        showMessage("Donation amount must be positive.", true);
        setLoading(false);
        return;
      }

      const txb = await donateTransaction(campaignId, amountSui);

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      showMessage(`Donation transaction submitted! Digest: ${result.digest}`);
      setDonationAmount('');
      fetchCampaignDetails(campaignId);

    } catch (err) {
      console.error("Donation failed:", err);
      showMessage(`Failed to donate: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-600">Donate</h3>
      <label htmlFor="donationAmount" className="block text-sm font-medium text-gray-600 mb-1">Amount (in MIST):</label>
      <input
        type="number"
        id="donationAmount"
        value={donationAmount}
        onChange={(e) => setDonationAmount(e.target.value)}
        placeholder="e.g., 500000000 (for 0.5 SUI)"
        min="1"
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
      />
      <button
        onClick={handleDonate}
        disabled={!wallet.connected || loading || !campaignId || !donationAmount || campaignClaimed}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {loading ? 'Donating...' : 'Donate SUI'}
      </button>
    </div>
  );
}