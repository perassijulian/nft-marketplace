import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { getContractSigned } from "../utils/getContract";

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const router = useRouter();
  
  async function loadNFTs() {
    const contract = await getContractSigned();
    const data = await contract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          tokenURI,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  useEffect(() => {
    loadNFTs();
  }, []);

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No NFTs owned</h1>;

  return (
    <div className="flex justify-center">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
              <img src={nft.image} className="rounded" />
              <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
              </div>
              <button
                className="w-full bg-pink-500 text-white text-bold py-2 px-12 mt-4 rounded"
                onClick={() => router.push(`/resell?tokenId=${nft.tokenId}&tokenURI=${nft.tokenURI}`)}
              >
                Sell
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
