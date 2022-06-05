const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();

  console.log("Marketplace deployed to: ", nftMarketplace.address);

  fs.writeFileSync(
    "./config.js",
    `
  export const marketplaceAddress = "${nftMarketplace.address}"
  `
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
