import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import { getContractSigned } from "../../utils/getContract";

export default function ResellNFT() {
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { tokenId, tokenURI } = router.query
  const { image, price } = formInput

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  async function listNFTForSale() {
    if (!price) return
    const contract = await getContractSigned();

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()

    let transaction = await contract.resellToken(tokenId, priceFormatted, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  useEffect(() => {
    fetchNFT()
  }, [])

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
  )
}