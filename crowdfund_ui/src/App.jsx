import React, { useEffect } from 'react';
import { useAccountBalance, useWallet } from "@suiet/wallet-kit";
import '@suiet/wallet-kit/style.css';
import { useSuiClient } from "@mysten/dapp-kit";

import Header from './components/common/Header';
import WalletInfo from './components/common/WalletInfo';
import Message from './components/common/Message';
import CampaignForm from './components/Campaign/CampaignForm';
import CampaignInteractionSection from './components/Interaction/CampaignInteractionSection';
import CampaignList from './components/Campaign/CampaignList';

import useMessages from './hooks/useMessages.js';
import useCampaignList from './hooks/useCampaignList';
import useCampaign from './hooks/useCampaign';

function App() {
  const wallet = useWallet();
  const client = useSuiClient();
  const { balance } = useAccountBalance();
  
  // Custom hooks
  const { loading, setLoading, error, successMessage, showMessage } = useMessages();
  const { campaignDetails, setCampaignDetails, fetchCampaignDetails } = useCampaign(wallet, client, showMessage);
  const { allCampaigns, fetchAllCampaigns } = useCampaignList(wallet, client, showMessage);
  
  // Clear messages on wallet change
  useEffect(() => {
    if (wallet.account) {
      showMessage(`Wallet connected: ${wallet.account.address.substring(0, 10)}...`);
    }
  }, [wallet.account]);

  const handleViewDetails = (campaignId) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const interactionInput = document.getElementById('interactionCampaignId');
    if (interactionInput) {
      interactionInput.value = campaignId;
      // Trigger fetchCampaignDetails with the selected ID
      fetchCampaignDetails(campaignId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 md:p-8">
      <Header />

      {wallet.connected && (
        <WalletInfo wallet={wallet} balance={balance} />
      )}

      <Message 
        loading={loading} 
        error={error} 
        successMessage={successMessage} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CampaignForm 
          wallet={wallet}
          showMessage={showMessage}
          setLoading={setLoading}
          loading={loading}
        />
        
        <CampaignInteractionSection 
          wallet={wallet}
          loading={loading}
          setLoading={setLoading}
          showMessage={showMessage}
          campaignDetails={campaignDetails}
          fetchCampaignDetails={fetchCampaignDetails}
        />
      </div>

      {wallet.connected && (
        <CampaignList 
          campaigns={allCampaigns} 
          loading={loading}
          fetchAllCampaigns={fetchAllCampaigns}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}

export default App;