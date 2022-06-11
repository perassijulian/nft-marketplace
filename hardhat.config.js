require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const { NEXT_PUBLIC_API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // mumbai: {
    //   url: NEXT_PUBLIC_API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`]
    // },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
