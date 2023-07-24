import { createContext, useContext, ReactNode } from 'react'
import {
  useSigningCosmWasmClient,
  ISigningCosmWasmClientContext
} from '../hooks/cosmwasm'
import { BigNumber } from '@injectivelabs/utils'

let CosmWasmContext: any
let { Provider } = (CosmWasmContext =
  createContext<ISigningCosmWasmClientContext>({
    injectiveAddress: '',
    ethereumAddress: '',
    loading: false,
    connectWallet: () => {},
    disconnect: () => {},
    getConfig: () => {},
    config: {
      totalNfts: 0,
      totalStaked: 0,
      totalAirdrop: 0,
      lastTime: 0,
      currentTime: 0,
      duration: 0,
      owner: '',
      collection: '',
      locktimeFee: 0,
      feeAddr: '',
      localTime: 0,
    },
    isAdmin: false,

    getBalances: () => {},
    nativeBalance: BigNumber(0),
    accountNfts: [],

    getUsdPrice: () => {},
    usdPrice: 0,

    getTotalEarned: () => {},
    totalEarned: 0,

    getStakedNfts: () => {},
    stakedNfts: [],

    executeStake:() => {},
    executeRestake:() => {},
    executeUnstake:() => {},
    executeClaim:() => {},

    getAirdropableAmount: () => {},
    airdropableAmount: BigNumber(0),

    getLockNftCount: () => {},
    lockNftCount: 0,

    executeAirdrop: () => {},
    executeCharge: () => {},
    executeUpdateConfig: () => {},
    executeAirdropRestart: () => {},
    executeWithdraw: () => {},

  }))

export const useSigningClient = (): ISigningCosmWasmClientContext =>
  useContext(CosmWasmContext)

export const SigningCosmWasmProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const value = useSigningCosmWasmClient()
  return <Provider value={value}>{children}</Provider>
}
