import React from 'react';
import PropTypes from 'prop-types';
import { formatSUI, truncateAddress } from '../../utils/formatters';

export default function CampaignCard({ campaign, onViewDetails }) {

  return (
    <div 
      className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition duration-300"
    >
      <div className="p-5">
        <div className="mb-2 flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 truncate">{campaign.name}</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">Epoch {campaign.deadline}</span>
        </div>
        
        <div className="mb-4 h-24 overflow-hidden">
          <p className="text-gray-600 text-sm line-clamp-3">
            {campaign.description}
          </p>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Campaign Goal</span>
            <span className="text-gray-700">{formatSUI(campaign.goal)} SUI</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs text-gray-500">
            <span className="block">Created by:</span>
            <span className="truncate block w-20">{truncateAddress(campaign.creator)}</span>
          </div>
          
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
            onClick={() => onViewDetails(campaign.id)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    goal: PropTypes.number.isRequired,
    raised_amount: PropTypes.number.isRequired,
    deadline: PropTypes.number.isRequired,
    creator: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  onViewDetails: PropTypes.func.isRequired,
};
