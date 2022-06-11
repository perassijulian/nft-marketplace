const hre = require("hardhat");
const fs = require("fs");

const frontEndAbiFile = "./constants/abi.json";
const frontEndContractsFile = "./constants/address.js";

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();

  console.log("Marketplace deployed to: ", nftMarketplace.address);

  fs.writeFileSync(
    frontEndContractsFile,
    `
  export const marketplaceAddress = "${nftMarketplace.address}"
  `
  );

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
