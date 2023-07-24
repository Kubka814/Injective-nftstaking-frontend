import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef } from "react";

import AirdropProgress from "../components/AirdropProgress";
import TITLE_BG from "../assets/images/top-title.png"

import { useSigningClient } from "../context/CosmwasmContext";
import { changeBackgroundUrl, copyClipboard } from "../utils/utils";
import AliensBtn from "../components/AliensBtn";
import { BigNumber } from "@injectivelabs/utils";
import { toast } from "react-toastify";

export default function Admin() {
  const navigate = useNavigate()

  const airdropAmount = useRef<HTMLInputElement>(null)
  const chargeAirdrop = useRef<HTMLInputElement>(null)
  const duration = useRef<HTMLInputElement>(null)
  const feeAddr = useRef<HTMLInputElement>(null)
  const locktimeFee = useRef<HTMLInputElement>(null)
  const collectionAddr = useRef<HTMLInputElement>(null)
  const ownerAddr = useRef<HTMLInputElement>(null)
  const withdraw = useRef<HTMLInputElement>(null)

  const { 
    isAdmin,
    injectiveAddress, 
    nativeBalance,
    disconnect, 
    config,
    getBalances,
    getConfig,
    getAirdropableAmount,
    airdropableAmount,
    getLockNftCount,
    lockNftCount,
    executeCharge,
    executeUpdateConfig,
    executeAirdrop,
    executeAirdropRestart,
    executeWithdraw
  } = useSigningClient()

  const handleDisconnect = () => {
    console.log("Disconnectting to Keplr Wallet...")
    disconnect();
    navigate("/")
  }

  useEffect(() => {
    if (injectiveAddress.length === 0 || !isAdmin)
      navigate("/")
    getBalances()
    getConfig()
    getAirdropableAmount()
    getLockNftCount()
  }, [])

  useEffect(() => {
    if (duration.current !== null) duration.current.value = (config as any).duration
    if (locktimeFee.current !== null) locktimeFee.current.value = (config as any).locktimeFee
    if (collectionAddr.current !== null) collectionAddr.current.value = (config as any).collection
    if (ownerAddr.current !== null) ownerAddr.current.value = (config as any).owner
    if (feeAddr.current !== null) feeAddr.current.value = (config as any).feeAddr
  }, [config, ])

  const showUserInfo = (address: string, balance: BigNumber) => {
    let res = address.substring(0,12) + "..." + address.substring(address.length - 6, address.length)
    res += ` (${balance.toFixed(2)}inj)`
    return res
  }

  const handleAirdrop = () => {
    const amount = airdropAmount.current?.value
    if (amount && parseInt(amount))
      executeAirdrop(amount)
    else
      toast.warn("Invalid input value.")
  }

  const handleChargeAirdrop = () => {
    const amount = chargeAirdrop.current?.value
    if (amount && parseInt(amount))
      executeCharge(amount)
    else
      toast.warn("Invalid input value.")
  }

  const handleWithdraw = () => {
    const amount = withdraw.current?.value
    if (amount && parseInt(amount))
      executeWithdraw(amount)
    else
      toast.warn("Invalid input value.")
  }

  const handleUpdateConfig = () => {
    let nftInfo = {
      duration: duration.current?.value,
      owner: ownerAddr.current?.value,
      feeAddr: feeAddr.current?.value,
      locktimeFee: locktimeFee.current?.value,
      collectionAddr: collectionAddr.current?.value
    }
    executeUpdateConfig(nftInfo)
  }

  const handleAirdropRestart = () => {
    executeAirdropRestart()
  }

  useEffect(() => {
    if (window.innerWidth > 768)
      changeBackgroundUrl('var(--main-bg-url)')
    else
      changeBackgroundUrl('var(--main-bg-sm-url)')
  }, [])

  return (
    <div className="admin__container container flex flex-col items-center">
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
          <Link to="/main" className="aliens-font3 ml-5 text-16">Back</Link>
        </div>
      </section>

      <section className="airdrop-info flex flex-col-reverse items-center lg:items-end justify-center my-14 gap-20 lg:flex-row w-full">
        <div className="locktime-progress">
          <AirdropProgress />
        </div>
      </section>

      <section className="admin-info flex flex-col gap-10 items-center w-full">
        <div className="flex flex-col flex-wrap w-full items-center justify-center lg:flex-row gap-5">
          <span>Available Airdrop Amount: </span>
          <label className="font-bold">{airdropableAmount.toFixed(2).toString()}inj</label>
        </div>
        <div className="flex flex-col flex-wrap w-full items-center justify-center lg:flex-row gap-5  ">
          <span>Unlock Staked Nft Count: </span>
          <label className="font-bold">{lockNftCount}</label>
        </div>
        <div className="flex flex-col flex-wrap w-full gap-10 items-center lg:flex-row">
          <input className="w-full lg:w-auto" type="text" placeholder="0inj" ref={airdropAmount}/>
          <AliensBtn onClick={handleAirdrop}>Airdrop</AliensBtn>
          <input className="w-full lg:w-auto" type="text" placeholder="0inj" ref={chargeAirdrop}/>
          <AliensBtn onClick={handleChargeAirdrop}>Charge Airdrop</AliensBtn>
          <input className="w-full lg:w-auto" type="text" placeholder="0inj" ref={withdraw}/>
          <AliensBtn onClick={handleWithdraw}>Withdraw</AliensBtn>
        </div>
      </section>

      <section className="config-info flex flex-col gap-5 mt-20">
        <div className="flex flex-row w-full gap-3">
          <span className="name">Duration:</span>
          <input className="w-full" placeholder="0s" ref={duration}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Owner:</span>
          <input className="w-full" ref={ownerAddr}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Fee address:</span>
          <input className="w-full" ref={feeAddr}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Unstake Fee:</span>
          <input className="w-full" placeholder="0inj" ref={locktimeFee}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Collection Address:</span>
          <input className="w-full" ref={collectionAddr}/>
        </div>
        <div className="flex flex-row w-full justify-center">
          <AliensBtn onClick={handleUpdateConfig}>Update Config</AliensBtn>
        </div>
        <div className="flex flex-row w-full justify-center mt-10">
          <AliensBtn onClick={handleAirdropRestart}>Airdrop Restart</AliensBtn>
        </div>
      </section>
    </div>
  );
}