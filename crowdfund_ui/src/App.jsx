import React, { useState, useEffect } from 'react';
import {
  ConnectButton,
  useAccountBalance,
  useWallet,
} from "@suiet/wallet-kit";
import { Transaction } from '@mysten/sui/transactions';
import '@suiet/wallet-kit/style.css';
import { useSuiClient } from "@mysten/dapp-kit";
// --- Configuration ---
// Replace with your deployed package ID
const PACKAGE_ID = "0x230fa32c5ddba4c75ca8299b8b2c5ac762d04051984f681ef36ec86bf6ba2092";
// Replace if your module name is different
const MODULE_NAME = "crowdfunding";
// Consider making the network configurable (e.g., devnet, testnet, mainnet)


function App() {
  const wallet = useWallet();
  const client = useSuiClient();
  console.log("Wallet connected:", wallet.connected);
  const { balance } = useAccountBalance();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // --- State for Creating Campaign ---
  const [campaignName, setCampaignName] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignGoal, setCampaignGoal] = useState(0); // Store as string initially
  const [campaignDeadlineEpochs, setCampaignDeadlineEpochs] = useState(0); // Store as string

  // --- State for Interacting with Campaign ---
  const [interactionCampaignId, setInteractionCampaignId] = useState('');
  const [donationAmount, setDonationAmount] = useState(0); // Store as string
  const [creatorCapId, setCreatorCapId] = useState(''); // Needed for claiming
  const [campaignDetails, setCampaignDetails] = useState(null);

  // --- Clear messages on wallet change ---
  useEffect(() => {
    setError(null);
    setSuccessMessage(null);
    setCampaignDetails(null); // Clear details when wallet changes
  }, [wallet.account]);

  // --- Helper to display messages ---
  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setError(null);
    }
    // Clear message after some time
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);
  };

  // --- Function to Create Campaign ---
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
    setError(null);
    setSuccessMessage(null);

    try {
      // console.log("Campaign details:", campaignName, campaignDesc, campaignGoal, campaignDeadlineEpochs);
      const goalAmount = BigInt(campaignGoal);
      const deadline = BigInt(campaignDeadlineEpochs);

      if (goalAmount <= 0 || deadline <= 0) {
          showMessage("Goal and Deadline Epochs must be positive numbers.", true);
          setLoading(false);
          return;
      }

      const txb = new Transaction();
      txb.setGasBudget(10000000);

      // Use String type directly instead of manually serializing to vector<u8>
      txb.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::create_campaign`,
        arguments: [
          // Pass strings directly since the contract now accepts String type
          txb.pure.string(campaignName),
          txb.pure.string(campaignDesc),
          txb.pure.u64(goalAmount.toString()), // Convert to string for Sui
          txb.pure.u64(deadline.toString()), // Convert to string for Sui
        ],
        typeArguments: []
      });

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      console.log("Create campaign result:", result);
      // TODO: Potentially extract the created Campaign ID and CreatorCap ID from effects
      // This requires `showEffects: true` and parsing the result.
      // For now, user needs to find the IDs manually (e.g., via Sui Explorer)
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

  // --- Function to Donate ---
  const handleDonate = async () => {
    if (!wallet.connected) {
      showMessage("Please connect your wallet first.", true);
      return;
    }
    if (!interactionCampaignId || !donationAmount) {
      showMessage("Please provide Campaign ID and Donation Amount.", true);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const amountSui = BigInt(donationAmount); // Amount in MIST (1 SUI = 1,000,000,000 MIST)
       if (amountSui <= 0) {
          showMessage("Donation amount must be positive.", true);
          setLoading(false);
          return;
      }

      const txb = new Transaction();
      txb.setGasBudget(100000000); // Set a gas budget for consistency

      // 1. Split the required SUI amount from the user's coins
      const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountSui)]);

      // 2. Call the donate function
      txb.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::donate`,
        arguments: [
          txb.object(interactionCampaignId), // Campaign object ID
          coin,                             // The coin object with the donation amount
        ],
      });

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: { showEffects: true },
      });

      console.log("Donate result:", result);
      showMessage(`Donation transaction submitted! Digest: ${result.digest}`);
      setDonationAmount(''); // Clear donation input
      fetchCampaignDetails(); // Refresh details after donating

    } catch (err) {
      console.error("Donation failed:", err);
      showMessage(`Failed to donate: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // --- Function to Claim Funds ---
  const handleClaimFunds = async () => {
      if (!wallet.connected) {
        showMessage("Please connect your wallet first.", true);
        return;
      }
      if (!interactionCampaignId || !creatorCapId) {
        showMessage("Please provide Campaign ID and Creator Cap ID.", true);
        return;
      }

      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
          const txb = new Transaction();
          txb.setGasBudget(100000000);

          txb.moveCall({
              target: `${PACKAGE_ID}::${MODULE_NAME}::claim_funds`,
              arguments: [
                  txb.object(interactionCampaignId), // Campaign object ID
                  txb.object(creatorCapId),         // CreatorCap object ID
              ],
          });

          const result = await wallet.signAndExecuteTransactionBlock({
              transactionBlock: txb,
              options: { showEffects: true },
          });

          console.log("Claim funds result:", result);
          showMessage(`Claim funds transaction submitted! Digest: ${result.digest}`);
          fetchCampaignDetails(); // Refresh details

      } catch (err) {
          console.error("Claim funds failed:", err);
          showMessage(`Failed to claim funds: ${err.message}`, true);
      } finally {
          setLoading(false);
      }
  };

  // --- Function to Request Refund ---
  const handleRequestRefund = async () => {
      if (!wallet.connected) {
        showMessage("Please connect your wallet first.", true);
        return;
      }
      if (!interactionCampaignId) {
        showMessage("Please provide Campaign ID.", true);
        return;
      }

      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
          const txb = new Transaction();
          txb.setGasBudget(100000000);

          txb.moveCall({
              target: `${PACKAGE_ID}::${MODULE_NAME}::request_refund`,
              arguments: [
                  txb.object(interactionCampaignId), // Campaign object ID
              ],
          });

          const result = await wallet.signAndExecuteTransactionBlock({
              transactionBlock: txb,
              options: { showEffects: true },
          });

          console.log("Request refund result:", result);
          showMessage(`Refund request transaction submitted! Digest: ${result.digest}`);
          fetchCampaignDetails(); // Refresh details

      } catch (err) {
          console.error("Request refund failed:", err);
          showMessage(`Failed to request refund: ${err.message}`, true);
      } finally {
          setLoading(false);
      }
  };

  // --- Function to Fetch Campaign Details ---
  const fetchCampaignDetails = async () => {
    if (!wallet.connected || !interactionCampaignId) {
      if (!interactionCampaignId) setCampaignDetails(null);
      else showMessage("Please connect wallet and enter Campaign ID.", true);
      return;
    }

    setLoading(true);
    setError(null);
    setCampaignDetails(null);

    console.log("Wallet connected:", wallet.connected);
    console.log("Wallet account:", wallet.account);
    console.log("Wallet chain:", wallet.chain);
    console.log("Wallet network:", wallet.network);
    console.log("PACKAGE_ID:", PACKAGE_ID);
    console.log("MODULE_NAME:", MODULE_NAME);
    console.log("interactionCampaignId:", interactionCampaignId);

    try {
      const txb = new Transaction();
      txb.setGasBudget(15000000); // Increased gas budget for safety

      txb.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::get_campaign_details_by_id`,
        arguments: [txb.object(interactionCampaignId)],
      });

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: txb,
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });

      console.log("Transaction result:", JSON.stringify(result, null, 2));

      // Query events using SuiClient
      const transactionDigest = result.digest;
      const eventsResult = await client.queryEvents({
        query: { Transaction: transactionDigest },
      });

      console.log("Fetched events:", JSON.stringify(eventsResult, null, 2));

      // Find the CampaignDetailsEvent
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

        console.log("Parsed campaign details:", details);
        setCampaignDetails(details);
        setSuccessMessage("Campaign details loaded successfully!");
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
  // --- Render UI ---
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-blue-600">Sui Crowdfunding dApp</h1>
        <ConnectButton />
      </header>

      {wallet.connected && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow">
          <p className="text-lg font-medium">Connected Wallet:</p>
          <p className="text-sm text-gray-600 break-all">{wallet.account?.address}</p>
          <p className="text-sm text-gray-600">Balance: {(Number(balance || 0) / 1_000_000_000).toFixed(4)} SUI</p>
           <p className="text-sm text-gray-600">Network: {wallet.chain?.name}</p>
        </div>
      )}

      {/* --- Messages --- */}
      {loading && <div className="mb-4 p-3 text-center bg-yellow-100 text-yellow-700 rounded-lg">Processing transaction...</div>}
      {error && <div className="mb-4 p-3 text-center bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {successMessage && <div className="mb-4 p-3 text-center bg-green-100 text-green-700 rounded-lg">{successMessage}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* --- Create Campaign Section --- */}
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
              disabled={!wallet.connected || loading }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </form>
        </section>

        {/* --- Interact with Campaign Section --- */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Interact with Campaign</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="interactionCampaignId" className="block text-sm font-medium text-gray-600 mb-1">Campaign Object ID:</label>
              <input
                type="text"
                id="interactionCampaignId"
                value={interactionCampaignId}
                onChange={(e) => {
                    setInteractionCampaignId(e.target.value);
                    setCampaignDetails(null); // Clear details when ID changes
                }}
                placeholder="Enter the Campaign Object ID"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Campaign Details Display */}
             <button
                onClick={fetchCampaignDetails}
                disabled={!wallet.connected || loading || !interactionCampaignId }
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out mb-4"
            >
                {loading ? 'Loading...' : 'Load Campaign Details'}
            </button>

            {campaignDetails && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 space-y-2 text-sm">
                    <h3 className="font-semibold text-lg mb-2">{campaignDetails.name}</h3>
                    <p><span className="font-medium">Description:</span> {campaignDetails.description}</p>
                    <p><span className="font-medium">Creator:</span> <span className="break-all">{campaignDetails.creator}</span></p>
                    <p><span className="font-medium">Goal:</span> {(Number(campaignDetails.goal) / 1_000_000_000).toFixed(4)} SUI ({campaignDetails.goal} MIST)</p>
                    <p><span className="font-medium">Raised:</span> {(Number(campaignDetails.raised_amount) / 1_000_000_000).toFixed(4)} SUI ({campaignDetails.raised_amount} MIST)</p>
                    <p><span className="font-medium">Deadline Epoch:</span> {campaignDetails.deadline}</p>
                    <p><span className="font-medium">Claimed:</span> {campaignDetails.claimed ? 'Yes' : 'No'}</p>
                    {/* TODO: Add current epoch display for context */}
                    {/* TODO: Add display for donor count and individual donation */}
                </div>
            )}


            {/* --- Donation --- */}
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
                    disabled={!wallet.connected || loading || !interactionCampaignId || !donationAmount || campaignDetails?.claimed }
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                    {loading ? 'Donating...' : 'Donate SUI'}
                </button>
            </div>

            {/* --- Claim Funds (Creator Only) --- */}
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
                    // Add more checks based on fetched details if available (e.g., deadline passed, goal reached)
                    disabled={!wallet.connected || loading || !interactionCampaignId || !creatorCapId || campaignDetails?.claimed }
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                    {loading ? 'Claiming...' : 'Claim Funds'}
                </button>
                 <p className="text-xs text-gray-500 mt-1">Only the campaign creator with the correct Creator Cap can claim after the deadline if the goal is met.</p>
            </div>

            {/* --- Request Refund (Donors) --- */}
             <div className="pt-4 border-t border-gray-200">
                 <h3 className="text-lg font-semibold mb-2 text-gray-600">Request Refund (Donors)</h3>
                <button
                    onClick={handleRequestRefund}
                     // Add more checks based on fetched details if available (e.g., deadline passed, goal *not* reached)
                    disabled={!wallet.connected || loading || !interactionCampaignId || campaignDetails?.claimed }
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                >
                    {loading ? 'Requesting...' : 'Request Refund'}
                </button>
                 <p className="text-xs text-gray-500 mt-1">Donors can request a refund after the deadline if the goal was not met.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App; // Export App for use in index.js
