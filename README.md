# 🧠 Think → 👨‍💻 Build → 🚀

✍️ **ETH Mobile** is an open-source toolkit for building decentralized applications (dApps) on Ethereum and other EVM-compatible blockchains. It simplifies mobile dApp development with fast, secure and customizable pre-built components to create, deploy and interact with smart contracts.

[Watch me mint a Snowman NFT!☃️](https://youtu.be/CaJTnRtLOK8)

⚙️ **Tech Stack**: Built with React Native, Foundry, Ethers, and TypeScript to streamline mobile dApp development.

### Key Features

- 🧑‍💻 **Contract Debugger**: Inspect smart contract details such as address, balance, variables, and functions. It also allows real-time interaction with contracts, making development more efficient.

![Contract Debugger](https://dewdrip.github.io/eth-mobile/assets/debugger.png)

- 💳 **In-Built Wallet**: A secure mobile crypto wallet for managing funds, signing transactions, and interacting with multiple EVM-compatible chains.

![Wallet](https://dewdrip.github.io/eth-mobile/assets/wallet.png)

- ✅ **Contract Hot Reload**: Automatically updates the mobile frontend to reflect changes made to smart contracts during development.
- 🪝 **Custom Hooks**: A collection of React hooks with TypeScript autocompletion, simplifying contract interaction in your mobile app.
- 🧱 **Web3 Components**: Pre-built components for quickly building mobile dApp frontends.

## Requirements

Before you begin, you need to install the following tools:

- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)
- [React Native](https://expo.dev/docs/environment-setup?guide=native&platform=android)
- [Yeet CLI](https://npmjs.com/package/yeet-cli)

## Quickstart

To get started, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/dewdrip/eth-mobile.git

cd eth-mobile

yarn install

cd packages/expo

npx pod-install
```

2. From the root folder, run a local network in the first terminal

```
yarn chain
```

This command starts a local Ethereum network hosted on your local IP address. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `foundry.toml`.

Alternatively, you can use [Ganache](https://archive.trufflesuite.com/ganache/) to persist the blockchain state during development

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/foundry/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/foundry/script` to deploy the contract to the network. You can also customize the deploy script.

4. Configure the local network provider:

```
yarn configure-network
```

This command sets your local IP address as your `localhost.provider` in `ethmobile.config.ts`. It uses the script located in `packages/expo/utils/eth-mobile/configureLocalNetwork.ts`

5. Set the `ALCHEMY_KEY` in `ethmobile.config.ts`

6. Prebuild native modules:

```
yarn prebuild
```

7. Run on device:

```
yarn android
```

```
yarn ios
```

> **Note:** if you wish to run your app in a physical device, your device must be connected to the same WIFI

You can interact with your smart contract using the `debugContracts` screen. You can configure your supported networks in `ethmobile.config.ts`.

Run smart contract test with `yarn foundry:test`

- Edit your smart contract `YourContract.sol` in `packages/foundry/contracts`
- Edit your deployment scripts in `packages/foundry/script`
- Edit your frontend in `packages/expo/app`

## Documentation

Visit our [docs](https://docs.ethmobile.io) to learn how to start building with ETH Mobile.

To know more about its features, check out our [website](https://www.ethmobile.io).

## Contributing to ETH Mobile

Contributors are always welcome to ETH Mobile!

Please see [CONTRIBUTING.MD](https://github.com/dewdrip/eth-mobile/blob/main/CONTRIBUTING.md) for more information and guidelines for contributing to ETH Mobile.
