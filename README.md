# CrowdFund

CrowdFund is a blockchain crowdfunding dapp. Creators publish campaigns and supporters donate ETH through a smart contract. Campaign progress, donations, success, refunds, rewards, and repayments are tracked on-chain.

## Features

- Create campaigns with funding targets and deadlines
- Donate ETH to active campaigns
- View campaign funding analytics and contributors
- Withdraw funds when campaign rules allow it
- Claim refunds for unsuccessful campaigns
- Configure rewards and repayment information
- View campaign and donation history
- Connect with OKX Wallet on Ethereum Sepolia Testnet

## Tech Stack

- React 19 and JSX
- Vite
- React Router DOM
- Ethers.js 6
- OKX Wallet EVM provider
- Vanilla CSS with responsive layouts
- ESLint

## Requirements

- Node.js 18 or newer
- npm
- OKX Wallet browser extension
- Sepolia ETH for transactions and gas

The app is configured for Sepolia Testnet only. Use chain ID `11155111`.

## Getting Started

From the project directory:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://localhost:5173`.

## Wallet Setup

1. Install and unlock the OKX Wallet browser extension.
2. Switch OKX Wallet to Sepolia Testnet.
3. Add Sepolia ETH to the account you want to use.
4. Open the dapp and select **Connect Wallet**.
5. Approve the connection in OKX Wallet.

The app listens for account and network changes from the OKX provider. To change accounts, use **Switch Account in OKX** or select another account directly in the OKX extension.

## Smart Contract Configuration

The frontend uses the deployed contract address and ABI in:

- `src/utils/config.js`
- `src/utils/abi.json`

The current contract address is:

```text
0x1588fc1474f97e56e0f3d230e6189d33b3dcbe3e
```

If the contract is redeployed, update `CONTRACT_ADDRESS` and replace the ABI before building the frontend.

## Available Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build locally
npm run lint     # Run ESLint
```

## Project Structure

```text
src/
  components/    Reusable UI components and forms
  context/       OKX Wallet connection state
  hooks/         Smart contract interaction hooks
  pages/         Application routes
  styles/        Global and component styles
  utils/         Contract configuration, ABI, and wallet helpers
```

## Network and Transactions

All write operations require a connected OKX Wallet account on Sepolia. Creating a campaign, donating, withdrawing, deleting a campaign, and claiming a refund or reward each creates a blockchain transaction that must be approved in OKX Wallet.

The frontend does not include a backend or database. Campaign data is read from the deployed smart contract.

## Deployment

Build the application with:

```bash
npm run build
```

The generated production files are placed in `dist/` and can be hosted on any static web host that supports a single-page application fallback for React Router.

## Important Notes

- Never share your wallet recovery phrase or private keys.
- Confirm that OKX Wallet is on Sepolia before submitting transactions.
- Test transactions require Sepolia ETH, not mainnet ETH.
- Contract interactions are permanent once confirmed on-chain.