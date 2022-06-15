import { ethers } from "ethers";
import Web3Modal, { getChainId } from "web3modal";

import marketplaceAddresses from "../constants/address.json";
import abi from "../constants/abi.json";

export const getContractSigned = async () => {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  const address = marketplaceAddresses["80001"][0];
  let contract = new ethers.Contract(address, abi, signer);
  return { contract, provider };
};

export const getContractPublic = async () => {
  //DEPLOYING FOR MUMBAI
  // const address = marketplaceAddresses["80001"][0];
  // const provider = new ethers.providers.JsonRpcProvider(
  //   process.env.NEXT_PUBLIC_API_URL_MUMBAI
  // );
  // const contract = new ethers.Contract(address, abi, provider);
  // return contract;
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const address = marketplaceAddresses["80001"][0];
  let contract = new ethers.Contract(address, abi, provider);
  return contract;

};
