import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import { getContractSigned } from "../utils/getContract";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [error, setError] = useState(null);

  async function loadNFTs() {
    setError(null);
    const { contract, provider } = await getContractSigned();

    const { chainId } = await provider.getNetwork();
    if (chainId !== 80001) {
      setError("Please connect to Mumbai network and refresh!");
      setLoadingState("loaded");
      return;
    }

    try {
      const data = await contract.fetchItemsListed();

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
          };
          return item;
        })
      );

      setNfts(items);
      setLoadingState("loaded");
    } catch (e) {
      console.log(e);
      setError(e);
    }
  }

  useEffect(() => {
    loadNFTs();
  }, []);

  if (error) return <h1 className="py-10 px-20 text-3xl">{error}</h1>;

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>;

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Listed</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div
              key={i}
              className="border shadow rounded-xl overflow-hidden flex flex-col items-center"
            >
              <img src={nft.image} className="rounded h-80 w-auto" />
              <div className="p-4 bg-pink-300 w-full cursor-default">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} MATIC
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
