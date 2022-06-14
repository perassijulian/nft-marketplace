import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

import { getContractPublic, getContractSigned } from "../utils/getContract";

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const contract = await getContractPublic();
    const data = await contract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  async function buyNft(nft) {
    setError(null);
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const { contract, provider } = await getContractSigned();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 80001) {
      setError("Please connect to Mumbai network!");
      return;
    }

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    try {
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
      await transaction.wait();

      router.push("/my-assets");
    } catch (e) {
      e.data.code == -32000
        ? setError(
            "You do not have sufficient funds. Consider getting more at a mumbai faucet"
          )
        : setError(e.data.message);
    }
  }

  if (loadingState == "loaded" && !nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items found</h1>;

  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: "1600px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden flex flex-col items-center"
            >
              <img className="w-auto h-80" src={nft.image} />
              <div className="p-4 w-full">
                <p
                  style={{ height: "64px" }}
                  className="text-2xl font-semibold"
                >
                  {nft.name}
                </p>
                <div style={{ height: "70px", overflow: "hidden" }}>
                  <p className="text-gray-400">{nft.description}</p>
                </div>
              </div>
              <div className="p-4 bg-pink-300 w-full">
                <p className="text-2xl font-bold text-white">{nft.price} MATIC</p>
                <button
                  className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => buyNft(nft)}
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
        {error && (
          <div className="flex justify-center">
            <div className="font-bold text-red-500 mt-8 animate-pulse">{error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
