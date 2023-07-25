import { createContext, ReactNode, useContext } from 'react'
import {
  ICosmWasmContext,
  useCosmWasmValue
} from '../hooks/cosmwasm'
import { BigNumber } from '@injectivelabs/utils'

const defaultState = {
  injectiveAddress: '',
  ethereumAddress: '',
  loading: false,
  connectWallet: () => {},
  disconnect: () => {},
  getConfig: () => {},
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

  getBalances: () => {},
  nativeBalance: BigNumber(0),
  setAccountNfts: () => {},
  loadingNfts: false,
  accountNfts: [],

  getUsdPrice: () => {},
  usdPrice: 0,

  getTotalEarned: () => {},
  totalEarned: 0,

  getStakedNfts: () => {},
  loadingStaked: false,
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

}

const CosmWasmContext = createContext<ICosmWasmContext>(defaultState)

export const useCosmWasmContext = () => useContext(CosmWasmContext)

export const CosmWasmProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const value = useCosmWasmValue()
  return (
    <CosmWasmContext.Provider value={value}>
      {children}
    </CosmWasmContext.Provider>
  )
}
