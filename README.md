# Sui Crowdfunding dApp

A decentralized crowdfunding platform built on the Sui blockchain. This dApp allows users to create, fund, and manage crowdfunding campaigns in a transparent and decentralized manner.

## Features

- **Create Campaigns**: Set up new crowdfunding campaigns with goals, deadlines, descriptions, and names
- **Browse Campaigns**: Discover and view all active campaigns
- **Donate**: Contribute SUI tokens to campaigns you want to support
- **Track Progress**: View detailed campaign stats including funding progress and deadlines
- **Creator Tools**: Campaign creators can claim funds when goals are met
- **Refund System**: Campaign contributors can request refunds if goals aren't met by the deadline


## Smart Contract

The smart contract implemented in Move handles all the critical functionality:

- Creating and storing campaign details
- Managing donations and campaign funds
- Handling fund claims by creators
- Processing refund requests
- Emitting events for frontend updates

### Key Contract Features

- Epoch-based deadlines for campaign expiration
- Owner capability pattern for secure fund claiming
- Table-based donation tracking
- Event emission for frontend synchronization

## Frontend Application

The React-based frontend provides an intuitive interface for users to interact with the crowdfunding contract on the Sui blockchain.

### Technologies Used

- **React**: UI framework
- **@mysten/dapp-kit**: Sui blockchain interaction
- **@suiet/wallet-kit**: Wallet connection and transactions
- **TailwindCSS**: Styling and UI components

## How to Use

### Prerequisites

- Sui wallet (Suiet, Sui Wallet, Ethos Wallet, etc.)
- SUI tokens on the Sui network (testnet or mainnet)

### Running the Frontend

```
cd crowdfund_ui
npm install
npm run dev
```

### Deploying the Smart Contract

1. Navigate to the contract directory:
2. Build the contract:
3. Publish the contract to the Sui network: sui client publish --gas-budget 10000000
4. Update the contract package ID in your frontend configuration.

## Development

### Frontend Development

- Run tests: `npm test`
- Build for production: `npm run build`

### Smart Contract Development

- Run tests: `sui move test`
- Build: `sui move build`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Sui Foundation
- Move Language Team
- Sui Developers Community