import { useState, useEffect } from 'react';
import { PACKAGE_ID, MODULE_NAME } from '../config';

export default function useCampaignList(wallet, client, showMessage) {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAllCampaigns = async () => {
    if (!wallet.connected || !client) {
      showMessage("Please connect your wallet first.", true);
      return;
    }

    setLoading(true);

    try {
      const packageId = PACKAGE_ID;
      const eventsResult = await client.queryEvents({
        query: {
          MoveEventType: `${packageId}::${MODULE_NAME}::CampaignCreatedEvent`
        },
        limit: 50,
      });

      if (eventsResult.data && eventsResult.data.length > 0) {
        const campaigns = eventsResult.data.map(event => {
          const data = event.parsedJson;
          return {
            id: data.campaign_id,
            creator: data.creator,
            goal: String(data.goal),
            deadline: String(data.deadline),
            name: data.name,
            description: data.description,
            raised_amount: '0',
            claimed: false,
          };
        });

        setAllCampaigns(campaigns);
        showMessage(`Loaded ${campaigns.length} campaigns`);
      } else {
        setAllCampaigns([]);
        showMessage("No campaigns found");
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      showMessage(`Failed to fetch campaigns: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchAllCampaigns();
    }
  }, [wallet.connected]);

  return {
    allCampaigns,
    setAllCampaigns,
    loading,
    fetchAllCampaigns
  };
}