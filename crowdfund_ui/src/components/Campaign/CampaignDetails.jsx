import React from 'react';
import PropTypes from 'prop-types';
import { formatSUI } from '../../utils/formatters';

export default function CampaignDetails({ campaignDetails }) {
  if (!campaignDetails) return null;

  // Calculate progress percentage
  const goalAmount = Number(campaignDetails.goal);
  const raisedAmount = Number(campaignDetails.raised_amount);
  const progressPercent = goalAmount > 0 ? Math.min(100, Math.round((raisedAmount / goalAmount) * 100)) : 0;
  
  // Determine progress bar color based on percentage
  let progressColor = 'bg-blue-600';
  if (progressPercent >= 100) {
    progressColor = 'bg-green-600';
  } else if (progressPercent >= 75) {
    progressColor = 'bg-blue-600';
  } else if (progressPercent >= 50) {
    progressColor = 'bg-blue-400';
  } else if (progressPercent >= 25) {
    progressColor = 'bg-yellow-500';
  } else {
    progressColor = 'bg-orange-500';
  }

  return (
    <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50 space-y-3 text-sm">
      <h3 className="font-semibold text-lg mb-2">{campaignDetails.name}</h3>
      <p><span className="font-medium">Description:</span> {campaignDetails.description}</p>
      <p><span className="font-medium">Creator:</span> <span className="break-all">{campaignDetails.creator}</span></p>
      
      {/* Progress section */}
      <div className="py-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium text-gray-700">Funding Progress:</span>
          <span className="font-bold text-gray-800">{progressPercent}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`${progressColor} h-3 rounded-full transition-all duration-500 ease-in-out`} 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs mt-1 text-gray-600">
          <span>{formatSUI(campaignDetails.raised_amount)} raised</span>
          <span>Goal: {formatSUI(campaignDetails.goal)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Goal</span>
          <p className="font-semibold">{formatSUI(campaignDetails.goal)} SUI</p>
        </div>
        <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Raised</span>
          <p className="font-semibold">{formatSUI(campaignDetails.raised_amount)} SUI</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Deadline</span>
          <p className="font-semibold">Epoch {campaignDetails.deadline}</p>
        </div>
        <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500">Status</span>
          <p className="font-semibold flex items-center">
            {campaignDetails.claimed ? (
              <><span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>Claimed</>
            ) : (
              <><span className="h-2 w-2 rounded-full bg-blue-500 mr-1"></span>Active</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

CampaignDetails.propTypes = {
  campaignDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    creator: PropTypes.string.isRequired,
    goal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    raised_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    deadline: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    claimed: PropTypes.bool.isRequired,
  }),
};