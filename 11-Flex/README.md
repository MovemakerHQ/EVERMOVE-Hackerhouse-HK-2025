# Flex: Smart On-Chain Portfolio & Trading Assistant
## Project Overview
Flex is an intelligent, AI-powered portfolio manager and trading assistant, seamlessly integrated with Merkle Trade, a decentralized perpetual DEX built on the Aptos blockchain. Flex automates portfolio analysis, strategy recommendations, and execution of high-leverage trades using USDC on the Merkle platform. With support for up to 150X leverage, users can maximize their yield potential while maintaining risk management practices, all in a seamless, secure environment.

## Core Features
### Portfolio Analysis
- Total Value & 24H Change: Upon connecting their wallet, users get a quick overview of their portfolio's total value and the 24-hour change in percentage, helping them understand the performance at a glance.

- Asset Breakdown: Flex displays detailed information about each token in the portfolio, including the amount held, contract addresses, and USD value for easy tracking. For example, users can view their ETH/USDC and BTC/USDC holdings, complete with current USD values.

### AI-Powered Trade Strategy Recommendations
For each asset in the portfolio (e.g., ETH/USDC or BTC/USDC), Flex’s AI engine analyzes the current market trend and provides a strategy recommendation.

### One-Click: Seamless Trade Execution
With the recommendation in hand, users can quickly select whether to Long or Short each token directly within the platform. After approval, the platform executes trades on Merkle Finance in real-time. The integration with Merkle Finance ensures that trades are executed at lightning speed with minimal slippage.

## Tech Stack

- `Next.js` + `React` framework
- Styling: `shadcn/ui` + `tailwind`
- Aptos Network Integration & Support: `Aptos TS SDK` + `Aptos Wallet Adapter`
- Move AI Agent Integration: [`Move-Agent-Kit`](https://github.com/Metamove/move-agent-kit) (Check out [`@component/MoveAIAgent`](./Flex/src/components/MoveAIAgent.tsx))
- Merkle Trade Integration: [`Merkle-TS-SDK`](https://github.com/merkle-trade/merkle-ts-sdk)
- The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI and `Node based Move commands` in a Node environment.
- [Next-pwa](https://ducanh-next-pwa.vercel.app/)

## Run App
```bash
# change directory to project Flex
cd Flex 
# install dependencies
npm install
# run dev
npm run dev
```
- Don't forget to rename `example.env` to `.env` and add your API key

## Run Backend (Portfolio Generator)    
```bash
# install dependencies
pip install -r data-process/requirements.txt
# for test
python data-process/test_api.py
# for running
python data-process/main.py

```

## What Move commands are available?

- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:upgrade` - a command to upgrade the Move contract
- `npm run dev` - a command to run the frontend locally
- `npm run deploy` - a command to deploy the dapp to Vercel