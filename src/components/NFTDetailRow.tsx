import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import DEFAULT_IMG from "../assets/images/empty-nft.png"
import { useCosmWasmContext } from "../context/CosmwasmContext"
import { getDays, getHours, getMinutes, getSeconds } from "../utils/utils"
import Injective from "../assets/icons/Injective"
import { useResponsiveView } from "../hooks/reponsive"

export default function NFTDetailRow ({
  data,
}: {
  data: any,
}) {

  const responseive_md = useResponsiveView(1024)

  const { 
    duration,
    currentTime,
    executeRestake,
    executeUnstake,
    executeClaim,
  } = useCosmWasmContext()

  const getStakedTime = () => {
    const stakedTime = currentTime + duration - data.lock_time

    if (getDays(stakedTime)>0) return `${getDays(stakedTime)} days`
    if (getHours(stakedTime)>0) return `${getHours(stakedTime)} hours`
    if (getMinutes(stakedTime)>0) return `${getMinutes(stakedTime)} mins`
    if (getSeconds(stakedTime)>0) return `${getSeconds(stakedTime)} seconds`
  }

  const getUnlockTime = () => {
    const current = currentTime
    const unlockTime = data.lock_time - current

    if (getDays(unlockTime)>0) return `${getDays(unlockTime)} days left`
    if (getHours(unlockTime)>0) return `${getHours(unlockTime)} hours left`
    if (getMinutes(unlockTime)>0) return `${getMinutes(unlockTime)} mins left`
    if (getSeconds(unlockTime)>0) return `${getSeconds(unlockTime)} seconds left`
  }

  const handleRestake = () => {
    if (data.lock_time > currentTime) return
    executeRestake(data.token_id)
  }

  const handleUnstake = () => {
    if (data.lock_time > currentTime)
      toast.info("You have to pay fee to unstake nft in lock time.")
    executeUnstake([data.token_id])
  }

  const handleClaim = () => {
    if (parseInt(data.airdrop) > 0) {
      executeClaim([data.token_id])
    }
  }

  const [isLoaded, setLoaded] = useState(false)
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const loadImage = async () => {
    const token_uri = data.nft_info.token_uri
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
        {responseive_md &&
        <span className={"aliens-font3 " + (data.lock_time>currentTime?" disabled":"")} onClick={handleRestake}>
          Restake
        </span>}
      </div>
      <div className="staked-day flex flex-col justify-center">
        <span>{getStakedTime()}</span>
        {responseive_md &&
        <span className="aliens-font3 " onClick={handleUnstake}>
          Unstake
        </span>}
      </div>
      <div className="until-day flex flex-col justify-center">
        <span>{getUnlockTime()}</span>
        {responseive_md &&
        <span className={"aliens-font3 flex flex-row items-center " + (data.airdrop==0?" disabled":"")} onClick={handleClaim}>
          Claim({data.airdrop.toNumber()}<Injective className="mx-1"/>)
        </span>}
      </div>
      <div className="actions flex flex-row justify-center gap-10 flex-grow hidden lg:flex">
        <span className={"aliens-font3" + (data.lock_time>currentTime?" disable disabled":"")} onClick={handleRestake}>
          Restake
        </span>
        <span className="aliens-font3" onClick={handleUnstake}>
          Unstake
        </span>
        <span className={"aliens-font3 flex flex-row items-center justify-center" + (data.airdrop==0?" disabled":"")} onClick={handleClaim}>
          Claim({data.airdrop.toNumber()}<Injective className="mx-1"/>)
        </span>
      </div>
    </div>
  )
}