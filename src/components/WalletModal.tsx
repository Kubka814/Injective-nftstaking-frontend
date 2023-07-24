import { useSigningClient } from "../context/CosmwasmContext"
import MetaMask from "../assets/icons/Metamask"
import Keplr from "../assets/icons/Keplr"

export default function WalletModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: Function
}) {

  const {
    connectWallet,
  } = useSigningClient()
  
  const handleKeplr = () => {
    connectWallet(0)
  }

  const handleMetamask = () => {
    connectWallet(1)
  }

  if (isOpen == false)
    return (<></>)
  return (
    <div className="wallet-modal fixed top-0 left-0 w-full h-full items-center flex justify-center">
      <div className="backdrop backdrop-blur fixed top-0 left-0 w-full h-full" onClick={()=>onClose(false)}></div>
      <div className="fixed flex flex-col gap-10">
        <div className="flex items-center gap-10 item" onClick={handleMetamask}>
          <MetaMask/>
          <span>MetaMask</span>
        </div>
        <div className="flex items-center gap-10 item" onClick={handleKeplr}>
          <Keplr/>
          <span>Keplr</span>
        </div>
      </div>
    </div>
  )
}