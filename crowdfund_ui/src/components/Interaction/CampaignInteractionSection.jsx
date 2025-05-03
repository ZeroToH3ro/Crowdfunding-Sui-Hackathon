/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import CampaignDetails from '../Campaign/CampaignDetails';
import DonateForm from './DonateForm';
import ClaimForm from './ClaimForm';
import RefundForm from './RefundForm';

export default function CampaignInteractionSection({ 
  wallet, 
  loading,
  setLoading,
  showMessage,
  campaignDetails,
  fetchCampaignDetails,
  registerViewDetailsHandler // New prop
}) {
  const [interactionCampaignId, setInteractionCampaignId] = useState('');

  const handleCampaignIdChange = (e) => {
    setInteractionCampaignId(e.target.value);
  };

  const handleLoadDetails = () => {
    if (interactionCampaignId) {
      fetchCampaignDetails(interactionCampaignId);
    }
  };

  useEffect(() => {
    if (registerViewDetailsHandler) {
      const updateCampaignId = (campaignId) => {
        setInteractionCampaignId(campaignId);
      };
      registerViewDetailsHandler(updateCampaignId);
    }
  }, [registerViewDetailsHandler]);

  return (
    <section className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Interact with Campaign</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="interactionCampaignId" className="block text-sm font-medium text-gray-600 mb-1">Campaign Object ID:</label>
          <input
            type="text"
            id="interactionCampaignId"
            value={interactionCampaignId}
            onChange={handleCampaignIdChange}
            placeholder="Enter the Campaign Object ID"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleLoadDetails}
          disabled={!wallet.connected || loading || !interactionCampaignId}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out mb-4"
        >
          {loading ? 'Loading...' : 'Load Campaign Details'}
        </button>

        <CampaignDetails campaignDetails={campaignDetails} />

        <DonateForm
          wallet={wallet}
          campaignId={interactionCampaignId}
          showMessage={showMessage}
          setLoading={setLoading}
          loading={loading}
          fetchCampaignDetails={() => fetchCampaignDetails(interactionCampaignId)}
          campaignClaimed={campaignDetails?.claimed}
        />

        <ClaimForm
          wallet={wallet}
          campaignId={interactionCampaignId}
          showMessage={showMessage}
          setLoading={setLoading}
          loading={loading}
          fetchCampaignDetails={() => fetchCampaignDetails(interactionCampaignId)}
          campaignClaimed={campaignDetails?.claimed}
        />

        <RefundForm
          wallet={wallet}
          campaignId={interactionCampaignId}
          showMessage={showMessage}
          setLoading={setLoading}
          loading={loading}
          fetchCampaignDetails={() => fetchCampaignDetails(interactionCampaignId)}
          campaignClaimed={campaignDetails?.claimed}
        />
      </div>
    </section>
  );
}