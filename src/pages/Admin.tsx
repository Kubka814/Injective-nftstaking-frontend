import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef } from "react";

import AirdropProgress from "../components/AirdropProgress";
import TITLE_BG from "../assets/images/top-title.png"

import { useCosmWasmContext } from "../context/CosmwasmContext";
import { changeBackgroundUrl, copyClipboard } from "../utils/utils";
import AliensBtn from "../components/AliensBtn";
import { BigNumber } from "@injectivelabs/utils";
import { toast } from "react-toastify";

export default function Admin() {
  const navigate = useNavigate()

  const ref_airdropAmount = useRef<HTMLInputElement>(null)
  const ref_chargeAirdrop = useRef<HTMLInputElement>(null)
  const ref_duration = useRef<HTMLInputElement>(null)
  const ref_feeAddr = useRef<HTMLInputElement>(null)
  const ref_locktimeFee = useRef<HTMLInputElement>(null)
  const ref_collectionAddr = useRef<HTMLInputElement>(null)
  const ref_ownerAddr = useRef<HTMLInputElement>(null)
  const ref_withdraw = useRef<HTMLInputElement>(null)

  const { 
    injectiveAddress, 
    disconnect, 
    nativeBalance,
    duration,
    locktimeFee,
    collection,
    owner,
    feeAddr,
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
  } = useCosmWasmContext()

  const handleDisconnect = () => {
    disconnect();
    navigate("/")
  }

  useEffect(() => {
    if (injectiveAddress.length === 0 || (injectiveAddress != owner))
      navigate("/")
    getBalances(false)
    getConfig()
    getAirdropableAmount()
    getLockNftCount()
  }, [])

  useEffect(() => {
    if (ref_duration.current !== null) ref_duration.current.value = duration.toString()
    if (ref_locktimeFee.current !== null) ref_locktimeFee.current.value = locktimeFee.toString()
    if (ref_collectionAddr.current !== null) ref_collectionAddr.current.value = collection
    if (ref_ownerAddr.current !== null) ref_ownerAddr.current.value = owner
    if (ref_feeAddr.current !== null) ref_feeAddr.current.value = feeAddr
  }, [duration, locktimeFee, collection, owner, feeAddr])

  const showUserInfo = (address: string, balance: BigNumber) => {
    let res = address.substring(0,12) + "..." + address.substring(address.length - 6, address.length)
    res += ` (${balance.toFixed(2)}inj)`
    return res
  }

  const handleAirdrop = () => {
    const amount = ref_airdropAmount.current?.value
    if (amount && parseInt(amount))
      executeAirdrop(amount)
    else
      toast.warn("Invalid input value.")
  }

  const handleChargeAirdrop = () => {
    const amount = ref_chargeAirdrop.current?.value
    if (amount && parseInt(amount))
      executeCharge(amount)
    else
      toast.warn("Invalid input value.")
  }

  const handleWithdraw = () => {
    const amount = ref_withdraw.current?.value
    if (amount && parseInt(amount))
      executeWithdraw(amount)
    else
      toast.warn("Invalid input value.")
  }

  const handleUpdateConfig = () => {
    let nftInfo = {
      duration: ref_duration.current?.value,
      owner: ref_ownerAddr.current?.value,
      feeAddr: ref_feeAddr.current?.value,
      locktimeFee: ref_locktimeFee.current?.value,
      collectionAddr: ref_collectionAddr.current?.value
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
          <input className="w-full lg:w-auto" type="text" placeholder="0inj" ref={ref_airdropAmount}/>
          <AliensBtn onClick={handleAirdrop}>Airdrop</AliensBtn>
          <input className="w-full lg:w-auto" type="text" placeholder="0inj" ref={ref_chargeAirdrop}/>
          <AliensBtn onClick={handleChargeAirdrop}>Charge Airdrop</AliensBtn>
          <input className="w-full lg:w-auto" type="text" placeholder="0inj" ref={ref_withdraw}/>
          <AliensBtn onClick={handleWithdraw}>Withdraw</AliensBtn>
        </div>
      </section>

      <section className="config-info flex flex-col gap-5 mt-20">
        <div className="flex flex-row w-full gap-3">
          <span className="name">Duration:</span>
          <input className="w-full" placeholder="0s" ref={ref_duration}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Owner:</span>
          <input className="w-full" ref={ref_ownerAddr}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Fee address:</span>
          <input className="w-full" ref={ref_feeAddr}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Unstake Fee:</span>
          <input className="w-full" placeholder="0inj" ref={ref_locktimeFee}/>
        </div>
        <div className="flex flex-row w-full gap-3">
          <span className="name">Collection Address:</span>
          <input className="w-full" ref={ref_collectionAddr}/>
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