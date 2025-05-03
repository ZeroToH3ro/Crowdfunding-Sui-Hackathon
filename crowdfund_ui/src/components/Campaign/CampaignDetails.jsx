import React from 'react';
import PropTypes from 'prop-types';
import { formatSUI } from '../../utils/formatters';

export default function CampaignDetails({ campaignDetails }) {
  if (!campaignDetails) return null;

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 space-y-2 text-sm">
      <h3 className="font-semibold text-lg mb-2">{campaignDetails.name}</h3>
      <p><span className="font-medium">Description:</span> {campaignDetails.description}</p>
      <p><span className="font-medium">Creator:</span> <span className="break-all">{campaignDetails.creator}</span></p>
      <p><span className="font-medium">Goal:</span> {formatSUI(campaignDetails.goal)} SUI ({campaignDetails.goal} MIST)</p>
      <p><span className="font-medium">Raised:</span> {formatSUI(campaignDetails.raised_amount)} SUI ({campaignDetails.raised_amount} MIST)</p>
      <p><span className="font-medium">Deadline Epoch:</span> {campaignDetails.deadline}</p>
      <p><span className="font-medium">Claimed:</span> {campaignDetails.claimed ? 'Yes' : 'No'}</p>
  </div>
);
}

CampaignDetails.propTypes = {
  campaignDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    goal: PropTypes.number.isRequired,
    raised_amount: PropTypes.number.isRequired,
    deadline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    claimed: PropTypes.bool.isRequired,
  }),
};