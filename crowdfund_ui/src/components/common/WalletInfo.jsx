/* eslint-disable react/prop-types */
import React from 'react';
import { formatSUI } from '../../utils/formatters';

export default function WalletInfo({ wallet, balance }) {
  if (!wallet.connected) return null;
  
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg shadow">
      <p className="text-lg font-medium">Connected Wallet:</p>
      <p className="text-sm text-gray-600 break-all">{wallet.account?.address}</p>
      <p className="text-sm text-gray-600">Balance: {formatSUI(balance)} SUI</p>
      <p className="text-sm text-gray-600">Network: {wallet.chain?.name}</p>
    </div>
  );
}