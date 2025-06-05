# ZKsync 101

This project was scaffolded with [ZKsync CLI](https://github.com/matter-labs/zksync-cli).

ZKsync 101 is a quick start template to help you learn how to
be a super developer using ZKsync CLI to build projects in the
ZKsync ecosystem!

This project is a Nodejs project that uses hardhat, viem, and solidity.
You will learn how to build, deploy and test smart contracts with hardhat
onto the ZKsync in memory node and use ZKsync CLI to interact with the contracts.

## Project Layout

- `/contracts`: Contains solidity smart contracts.
- `/deploy`: Scripts for contract deployment and interaction.
- `/test`: Test files.
- `hardhat.config.ts`: Configuration settings, the default network is set to "anvilZKsync".

## How to Use

1. Install dependencies with `npm install --force`.

2. Configure your ZKsync CLI to use the In memory node settings for dev.

   ```bash
   zksync-cli dev config
   ```

3. Start up a local in-memory node with ZKsync CLI with the following command:

   ```bash
   zksync-cli dev start
   ```

4. Follow along on ZKsync Docs in our [ZKsync 101](https://docs.zksync.io/build/start-coding/zksync-101)!

### Environment Settings

This project pulls in environment variables from `.env` files.

Rename `.env.example` to `.env`, the provided private key is a local rich wallet
that is available in the local in-memory node.

```txt
WALLET_PRIVATE_KEY=your_private_key_here...
```
npx hardhat compile

npm run deploy:leaderboard

npm run interact:leaderboard

## Contract Addressess

Deploying XsollaLeaderboard contract to XSollaSepolia
XsollaLeaderboard deployed to 0x4E87d90833185F8e2A92899EA145725f8ca4EB66

Deploying XsollaLeaderboard contract to neondevnet
XsollaLeaderboard deployed to 0x0B32a3F8f5b7E5d315b9E52E640a49A89d89c820

Deployed Addresses contract to Paseo
XsollaLeaderboardModule#XsollaLeaderboard - 0x5FbDB2315678afecb367f032d93F642f64180aa3

## License

This project is under the [MIT](./LICENSE) license.
