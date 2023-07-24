import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';

import AirdropProgress from "../components/AirdropProgress";
import AliensBtn from "../components/AliensBtn";
import NFTCard from "../components/NFTCard";

import TITLE_BG from "../assets/images/top-title.png";
import BTN_PREV from "../assets/icons/BtnPrev";
import BTN_NEXT from "../assets/icons/BtnNext";

import { useSigningClient } from "../context/CosmwasmContext";
import { changeBackgroundUrl, copyClipboard } from "../utils/utils";
import { BigNumber } from "@injectivelabs/utils";
import { toast } from "react-toastify";

export default function Main() {
  const navigate = useNavigate()

  const { 
    isAdmin,
    injectiveAddress, 
    nativeBalance,
    disconnect, 
    getConfig,
    getBalances,
    accountNfts,
    totalEarned,
    getTotalEarned,
    executeStake,
    executeUnstake,
    executeClaim,
    getStakedNfts,
    stakedNfts,
  } = useSigningClient()

  const handleDisconnect = () => {
    console.log("Disconnectting to Keplr Wallet...")
    disconnect();
    navigate("/")
  }

  useEffect(() => {
    if (injectiveAddress.length === 0) {
        navigate("/")
    }
    getConfig()
    getTotalEarned()
    getBalances()
    getStakedNfts()
  }, [])

  const [selectIds, setSelectIds] = useState<Array<string>>([])
  const insertSelectId = (id:string) => {
    let newIds = selectIds.slice()
    newIds.push(id)
    setSelectIds(newIds)
  }

  const removeSelectId = (id:string) => {
    setSelectIds(selectIds.filter((val) => (val !== id)))
  }

  const handleClickNft = (nft_id:string) => {
    let index = selectIds.indexOf(nft_id)
    if (index < 0)
      insertSelectId(nft_id)
    else
      removeSelectId(nft_id)
  }
  
  const NORMAL_NFT = 0;
  const BUY_NFT = 1;
  const EMPTY_NFT = 2;

  const carouselRef = useRef<AliceCarousel>(null)
  const handleBtnPrev = () => {
    if (carouselRef)
      carouselRef.current?.slidePrev()
  }
  const handleBtnNext = () => {
    if (carouselRef)
      carouselRef.current?.slideNext()
  }

  const [claimAmount, setClaimAmount] = useState<number>(0)

  const [selectStakeIds, setSelectStakeIds] = useState<Array<string>>([])

  const insertSelectStakeId = (id:string) => {
    let newIds = selectStakeIds.slice()
    newIds.push(id)
    setSelectStakeIds(newIds)
  }

  const removeSelectStakeId = (id:string) => {
    setSelectStakeIds(selectStakeIds.filter((val) => (val !== id)))
  }

  const handleClickStaked = (nft_id:string, airdrop:number) => {
    let index = selectStakeIds.indexOf(nft_id)
    if (index < 0) {
      insertSelectStakeId(nft_id)
      setClaimAmount((prev:number) => (prev + airdrop))
    } else {
      removeSelectStakeId(nft_id)
      setClaimAmount((prev:number) => (prev - airdrop))
    }
  }

  const handleStake = () => {
    if (!selectIds.length) {
      toast.warn("Select NFTs in your wallet.")
      return
    }
    executeStake(selectIds)
    setSelectIds([])
  }

  const handleUnstake = () => {
    if (!selectStakeIds.length) {
      toast.warn("Select staked NFTs.")
      return
    }
    executeUnstake(selectStakeIds)
    setSelectStakeIds([])
  }

  const handleClaim = () => {
    if (!selectStakeIds.length || claimAmount == 0) {
      toast.warn("No claimable amount.")
      return
    }
    executeClaim(selectStakeIds)
    setSelectStakeIds([])
    setClaimAmount(0)
  }

  const showUserInfo = (address: string, balance: BigNumber) => {
    let res = address.substring(0,12) + "..." + address.substring(address.length - 6, address.length)
    res += ` (${balance.toFixed(2)}inj)`
    return res
  }

  useEffect(() => {
    if (window.innerWidth > 768)
      changeBackgroundUrl('var(--main-bg-url)')
    else
      changeBackgroundUrl('var(--main-bg-sm-url)')
  }, [])

  return (
    <div className="main__container container flex flex-col">
      <section className="top-banner flex flex-col items-center gap-10 mt-10 lg:flex-row">
        <div className="w-[300px]"></div>
        <div className="top-title flex flex-grow justify-center">
          <img src={TITLE_BG}/>
        </div>
        <div className="wallet-info flex flex-row flex-wrap justify-center items-center w-[300px] lg:flex-nowrap">
          <span className="address cursor-pointer" onClick={() => copyClipboard(injectiveAddress)} title="Click to copy address to clipboard.">
            {showUserInfo(injectiveAddress, nativeBalance)}
            </span>
          <div className="aliens-font3 ml-5 text-16" onClick={handleDisconnect}>Disconnect</div>
          {isAdmin && <Link to="/admin" className="aliens-font3 ml-5 text-16">Airdrop</Link>}
        </div>
      </section>

      <section className="airdrop-info flex flex-col-reverse items-center lg:items-end justify-center my-14 gap-20 lg:flex-row w-full">
        <div className="total-earned flex flex-col gap-2 items-center lg:items-start">
          <span>Total Earned</span>
          <span className="text-36 w-max">{totalEarned.toFixed(2)} Inj</span>
        </div>
        <div className="locktime-progress">
          <AirdropProgress />
        </div>
      </section>

      <section className="nft-infos flex flex-wrap justify-center lg:flex-nowrap">
        <section className="flex flex-col w-full items-center lg:pr-[50px] lg:w-1/2">
          <div className="flex flex-wrap w-full">
            <span className="flex-grow">{accountNfts.length} NFTs in your wallet</span>
            <span className="font-bold hidden md:block">{selectIds.length} NFTs selected</span>
          </div>
          <div className="wallet-nfts flex flex-wrap mt-2">
            <NFTCard
              type={BUY_NFT}/>
            {accountNfts.map((nft:any) => (
              <NFTCard
                key={nft.token_id}
                data={nft}
                type={NORMAL_NFT}
                onClick={handleClickNft}
                isSelected={selectIds.indexOf(nft.token_id) >= 0}/>
            ))}
            {(accountNfts.length%3)>0 && (<NFTCard type={EMPTY_NFT}/>)}
            {(accountNfts.length%3)>1 && (<NFTCard type={EMPTY_NFT}/>)}
          </div>

          <div className="aliens-divider w-1/2 lg:hidden"></div>
          <div className="flex flex-col gap-10 mt-10 justify-center md:flex-row mb-20 lg:hidden">
            <span className="text-center font-bold md:hidden">{selectIds.length} NFT selected</span>
            <AliensBtn onClick={handleStake}>STAKE</AliensBtn>
          </div>
        </section>

        <section className="flex flex-col items-center mt-40 w-full lg:px-[30px] lg:mt-0 lg:w-1/2">
          <div className="flex flex-wrap w-full">
            <span className="flex-grow">{stakedNfts.length} NFTs staked</span>
            <span className="font-bold hidden md:block">{selectStakeIds.length} NFTs selected</span>
            <Link to="/details" className="aliens-font3 hidden lg:block ml-5">See Details</Link>
          </div>

          <div className="staked-nfts flex flex-row justify-center items-center gap-2 mt-5">
            <div className="btn-prev" onClick={handleBtnPrev}><BTN_PREV/></div>
            <AliceCarousel
              autoWidth
              disableDotsControls
              disableButtonsControls
              mouseTracking={false}
              ref={carouselRef} >
              {stakedNfts.map((nft: any) => (
                <div className="staked-nft-items mx-2" key={nft.token_id}>
                  <NFTCard 
                    type={NORMAL_NFT} 
                    data={nft} 
                    onClick={handleClickStaked} 
                    isSelected={selectStakeIds.indexOf(nft.token_id) >= 0}
                    />
                </div>
              ))}
            </AliceCarousel>
            <div className="btn-next" onClick={handleBtnNext}><BTN_NEXT/></div>
          </div>
          
          <Link to="/details" className="aliens-font3 lg:hidden mt-20">See Details</Link>
          <div className="aliens-divider w-1/2"></div>
          <div className="flex flex-col gap-10 mt-10 justify-center md:flex-row mb-20">
            <span className="text-center font-bold md:hidden">{selectStakeIds.length} NFT selected</span>
            <AliensBtn className="hidden lg:flex" onClick={handleStake}>STAKE</AliensBtn>
            <AliensBtn onClick={handleUnstake} title="You have to pay fee to unstake nft in lock time.">
              UNSTAKE
            </AliensBtn>
            <AliensBtn onClick={handleClaim}>
              CLAIM({claimAmount} inj)
            </AliensBtn>
          </div>
        </section>
      </section>

    </div>
  );
}