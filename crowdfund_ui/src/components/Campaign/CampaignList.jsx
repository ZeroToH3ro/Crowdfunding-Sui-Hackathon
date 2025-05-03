import React from 'react';
import PropTypes from 'prop-types';
import CampaignCard from './CampaignCard';

export default function CampaignList({ campaigns, loading, fetchAllCampaigns, onViewDetails }) {
    CampaignList.propTypes = {
      campaigns: PropTypes.array.isRequired,
      loading: PropTypes.bool.isRequired,
      fetchAllCampaigns: PropTypes.func.isRequired,
      onViewDetails: PropTypes.func.isRequired,
    };
    if (campaigns.length === 0) {
        return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m0 16v1m-9-9h1m3.343-3.343l.707.707M12 14.5c-1.4 0-2.5-1.1-2.5-2.5 0-1.4 1.1-2.5 2.5-2.5 1.4 0 2.5 1.1 2.5 2.5 0 1.4-1.1 2.5-2.5 2.5z" />
            </svg>
            <p className="mt-4 text-gray-600">No campaigns found</p>
            <button 
            onClick={fetchAllCampaigns} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            disabled={loading}
            >
            {loading ? 'Searching...' : 'Search for Campaigns'}
            </button>
        </div>
    )}

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">All Campaigns</h2>
            <button 
                className="flex items-center px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded-full hover:bg-blue-50 transition" 
                onClick={fetchAllCampaigns}
                disabled={loading}
            >
                {loading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </span>
                ) : (
                <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </span>
                )}
            </button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-gray-50">
            {campaigns.map(campaign => (
            <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onViewDetails={onViewDetails} 
            />
            ))}
        </div>
        
        {campaigns.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500 text-center">
                Showing {campaigns.length} campaign{campaigns.length !== 1 && 's'}
            </div>
            </div>
        )}
        </div>
    );
}