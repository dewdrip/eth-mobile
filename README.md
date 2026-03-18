# 📲 ETH Mobile

An open-source toolkit for building mobile decentralized applications (dApps) on Ethereum and other EVM-compatible blockchains. It simplifies mobile dApp development with fast, secure and customizable pre-built components to create, deploy and interact with smart contracts.

⚙️ **Tech Stack**: Built with React Native, Hardhat, Ethers, TypeScript, and Thirdweb to streamline mobile dApp development.

### Key Features

- 🧑‍💻 **Contract Debugger**: Inspect smart contract details such as address, balance, variables, and functions. It also allows real-time interaction with contracts, making development more efficient.

![Contract Debugger](https://eth-mobile.github.io/eth-mobile/assets/debugger.png)

- 💳 **In-Built Wallet**: Use your social account to own a secure mobile crypto wallet for managing funds, signing transactions, and interacting with EVM-compatible chains. Powered by [Thirdweb](https://thirdweb.com/)

![Wallet](https://eth-mobile.github.io/eth-mobile/assets/wallet.png)

- ✅ **Contract Hot Reload**: Automatically updates the mobile frontend to reflect changes made to smart contracts during development.
- 🪝 **Custom Hooks**: A collection of React hooks with TypeScript autocompletion, simplifying contract interaction in your mobile app.
- 🧱 **Web3 Components**: Pre-built components for quickly building mobile dApp frontends.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)
- [React Native](https://reactnative.dev/docs/set-up-your-environment)

## Quickstart

To get started, follow the steps below:

1. Install the latest version of ETH Mobile

```
npx eth-mobile
```

2. From the root folder, run a local network in the first terminal

```
yarn chain
```

This command starts a local Ethereum network hosted on your local IP address. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

Alternatively, you can use [Ganache](https://archive.trufflesuite.com/ganache/) to persist the blockchain state during development

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. Configure the local network provider:

```
yarn configure-network
```

This command sets your local IP address as your `hardhat.provider` in `ethmobile.config.ts`. It uses the script located in `packages/expo/utils/eth-mobile/configureLocalNetwork.ts`

5. Prebuild native modules:

```
yarn prebuild
```

6. Run on device:

```
yarn android
```

```
yarn ios
```

> **Note:** if you wish to run your app in a physical device, your device must be connected to the same WIFI

You can interact with your smart contract using the `debugContracts` screen. You can configure your supported networks in `ethmobile.config.ts`.

Run smart contract test with `yarn hardhat:test`

- Edit your smart contract `LuckyGuess.sol` in `packages/hardhat/contracts`
- Edit your deployment scripts in `packages/hardhat/deploy`
- Edit your frontend in `packages/expo/app`

## Documentation

Visit our [docs](https://docs.ethmobile.io) to learn how to start building with ETH Mobile.

To know more about its features, check out our [website](https://www.ethmobile.io).

## Contributing to ETH Mobile

Contributors are always welcome to ETH Mobile!

Please see [CONTRIBUTING.MD](https://github.com/eth-mobile/eth-mobile/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to ETH Mobile.
