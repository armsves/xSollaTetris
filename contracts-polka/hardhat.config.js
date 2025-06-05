require('@nomicfoundation/hardhat-toolbox');

require('@parity/hardhat-polkadot');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: '0.8.28',
    // npm Compiler
    resolc: {
        version: '1.5.2',
        compilerSource: 'npm',
        settings: {
            optimizer: {
                enabled: true,
                parameters: 'z',
                fallbackOz: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            polkavm: true,
        },
        polkadotHubTestnet: {
            polkavm: true,
            url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
            accounts: [process.env.PRIVATE_KEY],
        },
        'passet-hub': {
            url: 'https://blockscout-passet-hub.parity-testnet.parity.io/api/eth-rpc'
        },
    },
    etherscan: {
        apiKey: {
            'passet-hub': 'empty'
        },
        customChains: [
            {
                network: "passet-hub",
                chainId: 420420421,
                urls: {
                    apiURL: "https://blockscout-passet-hub.parity-testnet.parity.io/api",
                    browserURL: "https://blockscout-passet-hub.parity-testnet.parity.io"
                }
            }
        ]
    },
    sourcify: {
        enabled: true
    }

};