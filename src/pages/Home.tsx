import { useEffect, useState } from "react";
import { Link, useNavigate } from 'react-router-dom'

import InfoCard from "../components/InfoCard";
import AliensBtn from "../components/AliensBtn";

import TITLE_BG from "../assets/images/top-title.png"
import IMG_LINK1 from "../assets/images/twitter.png"
import IMG_LINK2 from "../assets/images/injective.png"
import IMG_LINK3 from "../assets/images/medium.png"
import IMG_LINK4 from "../assets/images/discord.png"

import { changeBackgroundUrl } from "../utils/utils";
import WalletModal from "../components/WalletModal";

import { useAppStore } from "../store/app";
import useWallet from "../hooks/useWallet";

export default function Home() {
  const navigate = useNavigate();
  const wallet = useWallet()

  useEffect(() => {
    if (wallet)
      navigate("/main")
  }, [wallet, ])

  const app = useAppStore((state:any) => (state))

  useEffect(() => {
    app.fetchUsdPrice()
    app.fetchCollection()
    app.fetchStakingContract()
  }, [])

  const [walletOpen, setOpen] = useState<boolean>(false)
  const handleOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (window.innerWidth > 768)
      changeBackgroundUrl('var(--home-bg-url)')
    else
      changeBackgroundUrl('var(--home-bg-sm-url)')
  }, [])

  return (
    <div className="home__container container flex flex-col items-center">
      <section className="top-title">
        <img src={TITLE_BG}/>
      </section>

      <section className="staking-info flex flex-row w-full">
        <InfoCard
          value={app.totalNfts}
          label={"NFTs"}
          />
        <InfoCard
          value={app.totalStaked}
          label={"Staked"}
          />
        <InfoCard
          value={app.totalAirdrop * app.usdPrice}
          label={"Total"}
          isUsd={true}
          />
      </section>

      <section className="btn-connect">
        <AliensBtn onClick={handleOpen}>CONNECT WALLET</AliensBtn>
      </section>

      <section className="contact-links">
        <h2 className="contact-title">CONTACT US</h2>
        <div className="flex flex-row mt-12">
          <Link to="https://twitter.com/AliensOnInj"><img src={IMG_LINK1}/></Link>
          <Link to="https://injective.talis.art/collection/649722487bb389db4355d335"><img src={IMG_LINK2}/></Link>
          <Link to="https://medium.com/@AliensOnInjective/what-is-aliens-on-injective-91825e43cde4"><img src={IMG_LINK3}/></Link>
          <Link to="https://discord.gg/tFKP9CBzG8"><img src={IMG_LINK4}/></Link>
        </div>
      </section>

      <WalletModal
        isOpen={walletOpen}
        onClose={handleClose}
        />
    </div>
  );
}
