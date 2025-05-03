import React from 'react';
import { ConnectButton } from "@suiet/wallet-kit";

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-300">
      <h1 className="text-3xl font-bold text-blue-600">Sui Crowdfunding dApp</h1>
      <ConnectButton />
    </header>
  );
}