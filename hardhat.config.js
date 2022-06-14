require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

const NEXT_PUBLIC_API_URL_MUMBAI = process.env.NEXT_PUBLIC_API_URL_MUMBAI;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    mumbai: {
      url: NEXT_PUBLIC_API_URL_MUMBAI,
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 80001
    },
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
