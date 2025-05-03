import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULE_NAME } from '../config';

export async function createCampaignTransaction(name, description, goal, deadline) {
  const txb = new Transaction();
  txb.setGasBudget(10000000);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::create_campaign`,
    arguments: [
      txb.pure.string(name),
      txb.pure.string(description),
      txb.pure.u64(goal.toString()),
      txb.pure.u64(deadline.toString()),
    ],
    typeArguments: []
  });

  return txb;
}

export async function donateTransaction(campaignId, amount) {
  const txb = new Transaction();
  txb.setGasBudget(100000000);

  const [coin] = txb.splitCoins(txb.gas, [txb.pure.u64(amount)]);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::donate`,
    arguments: [txb.object(campaignId), coin],
  });

  return txb;
}

export async function claimFundsTransaction(campaignId, creatorCapId) {
  const txb = new Transaction();
  txb.setGasBudget(100000000);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::claim_funds`,
    arguments: [txb.object(campaignId), txb.object(creatorCapId)],
  });

  return txb;
}

export async function requestRefundTransaction(campaignId) {
  const txb = new Transaction();
  txb.setGasBudget(100000000);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::request_refund`,
    arguments: [txb.object(campaignId)],
  });

  return txb;
}

export async function getCampaignDetailsTransaction(campaignId) {
  const txb = new Transaction();
  txb.setGasBudget(15000000);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::get_campaign_details_by_id`,
    arguments: [txb.object(campaignId)],
  });

  return txb;
}