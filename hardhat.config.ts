import * as dotenv from 'dotenv';
dotenv.config();

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-vyper";
import "hardhat-abi-exporter";
import "@typechain/hardhat";

export default {
    defaultNetwork: "local",
    solidity: {
        compilers: [
            {
                version: "0.6.12",
                settings: {
                    optimizer: {
                    enabled: true,
                    runs: 200,
                    },
                },
            },

        ]
    },
    vyper: {
        compilers: [{ version: "0.2.4" }, { version: "0.2.7" }],
    },
    networks: {
        local: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
        milkomedaTestnet: {
            url: 'http://use-util.cloud.milkomeda.com:8545',
            chainId: 200101,
            accounts: {
                mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : '',
            },
        },
        milkomeda: {
            url: 'https://rpc.c1.milkomeda.com:8545',
            chainId: 2001,
            accounts: {
                mnemonic: process.env.MNEMONIC ? process.env.MNEMONIC : '',
            },
        }
    },
    typechain: {
        outDir: "./dist/types",
        target: "ethers-v5",
    },
    abiExporter: {
        path: "./dist/abis",
        clear: false,
        flat: true,
    }
}