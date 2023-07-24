import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import AirdropProgress from "../components/AirdropProgress";
import NFTDetailRow from "../components/NFTDetailRow";
import TITLE_BG from "../assets/images/top-title.png"

import { useSigningClient } from "../context/CosmwasmContext";
import { changeBackgroundUrl, copyClipboard } from "../utils/utils";
import { BigNumber } from "@injectivelabs/utils";

export default function Details() {
  const navigate = useNavigate()

  const { 
    isAdmin,
    injectiveAddress, 
    nativeBalance,
    disconnect, 
    getBalances,
    getStakedNfts,
    getConfig,
    totalEarned,
    stakedNfts,
  } = useSigningClient()

  const handleDisconnect = () => {
    console.log("Disconnectting to Keplr Wallet...")
    disconnect();
    navigate("/")
  }

  useEffect(() => {
    getBalances()
    getStakedNfts()
    getConfig()
    if (injectiveAddress.length === 0)
      navigate("/")
  }, [])

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
    <div className="details__container container flex flex-col">
      <section className="top-banner flex flex-col items-center gap-10 mt-10 lg:flex-row">
        <div className="w-[300px]"></div>
        <div className="top-title flex justify-center flex-grow">
          <img src={TITLE_BG}/>
        </div>
        <div className="wallet-info flex flex-row flex-wrap justify-center items-center w-[300px] lg:flex-nowrap">
          <span className="address cursor-pointer" onClick={() => copyClipboard(injectiveAddress)}>
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

      <section className="nft-details relative text-18">
        <Link to="/main" className="absolute top-[-24px] right-0 aliens-font3 ml-5 text-16 lg:right-10">Back</Link>

        <div className="header flex flex-row w-full">
          <span className="nft-img">Image</span>
          <span className="nft-id">#</span>
          <span className="staked-day">Time staked</span>
          <span className="until-day">Until unlock</span>
          <span className="actions hidden flex-grow lg:flex"></span>
        </div>

        <div className="body w-full">
          {stakedNfts.map((nft: any) => (
            <NFTDetailRow
              key={nft.token_id}
              data={nft}
              />
          ))}
        </div>
      </section>
    </div>
  );
}