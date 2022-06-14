import { ethers } from "ethers";
import { useState } from "react";
import { useRouter } from "next/router";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { getContractSigned } from "../utils/getContract";
import { getChainId } from "web3modal";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formInput, setFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const [error, setError] = useState(null);
  const router = useRouter();

  async function onChange(e) {
    setUploadingImage(true);
    /* upload image to IPFS */
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setFileUrl(url);
      setUploadingImage(false);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function uploadToIPFS() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function listNFTForSale() {
    const { contract, provider } = await getContractSigned();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 80001) {
      setError("Please connect to Mumbai network!");
      return;
    }

    const url = await uploadToIPFS();

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    try {
      let transaction = await contract.createToken(url, price, {
        value: listingPrice,
      });
      await transaction.wait();
      router.push("/");
    } catch (e) {
      e.data.code == -32000
        ? setError(
            "You do not have sufficient funds. Consider getting more at a mumbai faucet"
          )
        : setError(e.data.message);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={(e) => setFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={(e) =>
            setFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        {error && <div>{error}</div>}
        <button
          onClick={listNFTForSale}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
          disabled={uploadingImage}
        >
          {uploadingImage ? "Uploading Image" : "Create NFT"}
        </button>
      </div>
    </div>
  );
}
