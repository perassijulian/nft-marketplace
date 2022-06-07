import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { marketplaceAddress } from "../config";
import NFTMarketplace from "../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json";

export const getContractSigned = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  let contract = new ethers.Contract(
    marketplaceAddress,
    NFTMarketplace.abi,
    signer
  );
  return contract;
};

export const getContractPublic = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_API_URL);
  const contract = new ethers.Contract(
    marketplaceAddress,
    NFTMarketplace.abi,
    provider
  );
  return contract;
};
