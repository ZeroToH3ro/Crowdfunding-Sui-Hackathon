import { useState } from 'react';
import { getCampaignDetailsTransaction } from '../services/contractService';

export default function useCampaign(wallet, client, showMessage) {
  const [campaignDetails, setCampaignDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCampaignDetails = async (campaignId) => {
    if (!wallet.connected || !campaignId) {
      if (!campaignId) setCampaignDetails(null);
      else showMessage("Please connect wallet and enter Campaign ID.", true);
      return;
    }

    setLoading(true);
    setCampaignDetails(null);

    try {
      const txb = await getCampaignDetailsTransaction(campaignId);

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });

      const transactionDigest = result.digest;
      const eventsResult = await client.queryEvents({
        query: { Transaction: transactionDigest },
      });

      const detailsEvent = eventsResult.data.find(event =>
        event.type.includes('CampaignDetailsEvent')
      );

      if (detailsEvent && detailsEvent.parsedJson) {
        const eventData = detailsEvent.parsedJson;
        const details = {
          creator: eventData.creator || "",
          goal: eventData.goal ? String(eventData.goal) : '0',
          raised_amount: eventData.raised_amount ? String(eventData.raised_amount) : '0',
          deadline: eventData.deadline ? String(eventData.deadline) : '0',
          claimed: eventData.claimed === true,
          name: eventData.name || "",
          description: eventData.description || "",
        };

        setCampaignDetails(details);
        showMessage("Campaign details loaded successfully!");
      } else {
        throw new Error("Campaign details event not found");
      }
    } catch (err) {
      console.error("Fetch details failed:", err);
      showMessage(`Failed to fetch campaign details: ${err.message}`, true);
      setCampaignDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    campaignDetails,
    setCampaignDetails,
    loading,
    fetchCampaignDetails
  };
}