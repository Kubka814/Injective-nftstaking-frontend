import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import DEFAULT_IMG from "../assets/images/empty-nft.png"
import { useSigningClient } from "../context/CosmwasmContext"
import { getDays, getHours, getMinutes, getSeconds } from "../utils/utils"
import Injective from "../assets/icons/Injective"

export default function NFTDetailRow ({
  data,
}: {
  data: any,
}) {

  const { 
    config ,
    executeRestake,
    executeUnstake,
    executeClaim,
  } = useSigningClient()

  const getStakedTime = () => {
    const stakedTime = config.currentTime + config.duration - data.lock_time

    if (getDays(stakedTime)>0) return `${getDays(stakedTime)} days`
    if (getHours(stakedTime)>0) return `${getHours(stakedTime)} hours`
    if (getMinutes(stakedTime)>0) return `${getMinutes(stakedTime)} mins`
    if (getSeconds(stakedTime)>0) return `${getSeconds(stakedTime)} seconds`
  }

  const getUnlockTime = () => {
    const current = config.currentTime
    const unlockTime = data.lock_time - current

    if (getDays(unlockTime)>0) return `${getDays(unlockTime)} days left`
    if (getHours(unlockTime)>0) return `${getHours(unlockTime)} hours left`
    if (getMinutes(unlockTime)>0) return `${getMinutes(unlockTime)} mins left`
    if (getSeconds(unlockTime)>0) return `${getSeconds(unlockTime)} seconds left`
  }

  const handleRestake = () => {
    executeRestake(data.token_id)
  }

  const handleUnstake = () => {
    if (data.lock_time > config.currentTime)
      toast.info("You have to pay fee to unstake nft in lock time.")
    executeUnstake([data.token_id])
  }

  const handleClaim = () => {
    if (parseInt(data.airdrop) > 0) {
      executeClaim([data.token_id])
    } else {
      toast.info("No airdrop amount.")
    }
  }

  const [isLoaded, setLoaded] = useState(false)
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadImage = async () => {
    const token_uri = data.nft_info.info.token_uri
    if (!token_uri) return
    const uri: string = token_uri.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(uri);
    const metadata = await response.json();
    setTitle(metadata.title);
    const imageUrl = metadata.media.replace("ipfs://", "https://ipfs.io/ipfs/");

    try {
      const response = await fetch(imageUrl);
  
      if (!response.ok) {
        throw new Error(`Failed to load image from ${imageUrl}`);
      }
    
      setImageUrl(imageUrl);
      setLoaded(true)
    } catch (error) {
      console.error("An error occurred while loading the image:", error);
    }
  };

  useEffect(() => {
    if (data) {
      loadImage();
    }
  })

  return (
    <div className="nft-row flex flex-row items-center w-full">
      <div className="nft-img">
        { isLoaded ? (
          <img src={imageUrl}/>
        ) : (
          <img src={DEFAULT_IMG}/>
        ) }
      </div>
      <div className="nft-id flex flex-col justify-center">
        <span>{title}</span>
        {data.lock_time<config.currentTime && 
        <span className="aliens-font3 lg:hidden" onClick={handleRestake}>
          Restake
        </span>}
      </div>
      <div className="staked-day flex flex-col justify-center">
        <span>{getStakedTime()}</span>
        <span className="aliens-font3 lg:hidden" onClick={handleUnstake}>
          Unstake
        </span>
      </div>
      <div className="until-day flex flex-col justify-center">
        <span>{getUnlockTime()}</span>
        {data.airdrop > 0 && (
        <span className="aliens-font3 flex flex-row items-center lg:hidden" onClick={handleClaim}>
          Claim({data.airdrop.toNumber()}<Injective className="mx-1"/>)
        </span>)}
      </div>
      <div className="actions flex flex-row justify-center gap-10 flex-grow hidden lg:flex">
        {data.lock_time<config.currentTime && 
        <span className="aliens-font3" onClick={handleRestake}>
          Restake
        </span>}
        <span className="aliens-font3" onClick={handleUnstake}>
          Unstake
        </span>
        <span className="aliens-font3 flex flex-row items-center justify-center" onClick={handleClaim}>
          Claim({data.airdrop.toNumber()}inj)
        </span>
      </div>
    </div>
  )
}