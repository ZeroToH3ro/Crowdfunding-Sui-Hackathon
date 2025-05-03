/* eslint-disable react/prop-types */
import React from 'react';
import { requestRefundTransaction } from '../../services/contractService';

export default function RefundForm({
  wallet,
  campaignId,
  showMessage,
  setLoading,
  loading,
  fetchCampaignDetails,
  campaignClaimed
}) {
  const handleRequestRefund = async () => {
    if (!wallet.connected) {
      showMessage("Please connect your wallet first.", true);
      return;
    }
    if (!campaignId) {
      showMessage("Please provide Campaign ID.", true);
      return;
    }

    setLoading(true);

    try {
      const txb = await requestRefundTransaction(campaignId);

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      showMessage(`Refund request transaction submitted! Digest: ${result.digest}`);
      fetchCampaignDetails(campaignId);
    } catch (err) {
      console.error("Request refund failed:", err);
      showMessage(`Failed to request refund: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold mb-2 text-gray-600">Request Refund (Donors)</h3>
      <button
        onClick={handleRequestRefund}
        disabled={!wallet.connected || loading || !campaignId || campaignClaimed}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
      >
        {loading ? 'Requesting...' : 'Request Refund'}
      </button>
      <p className="text-xs text-gray-500 mt-1">Donors can request a refund after the deadline if the goal was not met.</p>
    </div>
  );
}