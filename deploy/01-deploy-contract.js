const hre = require("hardhat");
const fs = require("fs");
const { network } = require("hardhat");

const frontEndAbiFile = "./constants/abi.json";
const frontEndContractsFile = "./constants/address.json";

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();

  console.log('network.config:', network.config);
  console.log('network.config.chainId:', network.config.chainId);
  const chainId = network.config.chainId.toString();
  const addresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf-8"));
  if (chainId in addresses) {
    if (!addresses[chainId].includes(nftMarketplace.address)) {
      addresses[chainId].push(nftMarketplace.address);
    }
  } else {
    addresses[chainId] = [nftMarketplace.address];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(addresses));

  fs.writeFileSync(
    frontEndAbiFile,
    nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
