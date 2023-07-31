import { create } from 'zustand'
import { persist } from "zustand/middleware";

import { toBase64, fromBase64 } from "@injectivelabs/sdk-ts";
import { BigNumberInWei } from '@injectivelabs/utils';

import { 
  chainGrpcWasmApi,
  indexerGrpcOracleApi,
  test_chainGrpcWasmApi,
  test_chainGrpcBankApi,
} from '../utils/networks';

interface AppState {
  loading: boolean,
  totalNfts: number
  totalStaked: number
  totalAirdrop: number
  lastTime: number
  currentTime: number
  duration: number
  owner: string
  collection: string
  locktimeFee: number
  feeAddr: string
  localTime: number
  usdPrice: number
  airdropable: number
  lockNftCount: number
  fetchCollection: Function
  fetchStakingContract: Function
  fetchUsdPrice: Function
  fetchAirdropable: Function
  fetchLockNftCount: Function
}

export const useAppStore = create<AppState>() (
  persist(
    (set) => ({
      loading: false,
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
      usdPrice: 1,
      airdropable: 0,
      lockNftCount: 0,
      fetchCollection: async () => {
        try {
          const response:any = await chainGrpcWasmApi.fetchSmartContractState(
            import.meta.env.VITE_PUBLIC_ALIEN_COLLECTION,
            toBase64({ 
              num_tokens: {} 
            })
          )
          if (response) {
            const result = fromBase64(response.data)
            set({
              totalNfts: result.count
            })
          }
        } catch (error) {
          console.log(false, `Get Config error : ${error}`)
        }
      },
      fetchStakingContract: async () => {
        try {
          const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
            import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
            toBase64({ 
              get_config: {} 
            })
          )
    
          if (response) {
            const result = fromBase64(response.data)
            set({
              collection: result.collection_address,
              currentTime: result.current_time,
              duration: result.duration,
              lastTime: result.last_airdrop_time,
              owner: result.owner,
              totalStaked: result.total_staked,
              totalAirdrop: new BigNumberInWei(result.total_airdrop).toBase().toNumber(),
              locktimeFee: new BigNumberInWei(result.locktime_fee).toBase().toNumber(),
              feeAddr: result.fee_address,
              localTime: Math.floor(Date.now()/1000)
            })
          }
        } catch (error) {
          console.log(false, `Get Config error : ${error}`)
        }
      },
      fetchUsdPrice: async () => {
        const baseSymbol = "INJ"
        const quoteSymbol = "USDT"
        const oracleType = "bandibc"
    
        const oraclePrice = await indexerGrpcOracleApi.fetchOraclePriceNoThrow({
          baseSymbol,
          quoteSymbol,
          oracleType,
        })
    
        set({usdPrice: parseInt(oraclePrice.price)})
      },
      fetchAirdropable: async () => {
        try {
          const balance = await test_chainGrpcBankApi.fetchBalance({
            accountAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT, 
            denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM
          })
          set({airdropable: new BigNumberInWei(balance.amount).toBase().toNumber()})
        } catch (error) {
        }
      },
      fetchLockNftCount: async () => {
        try {
          const response: any = await test_chainGrpcWasmApi.fetchSmartContractState(
            import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
            toBase64({
              get_total_locked: {}
            })
          )
          if (response) {
            const result = fromBase64(response.data)
            set({lockNftCount: result.count})
          }
        } catch (error) {
        }
      },
    }),
    {
      name: "app-state"
    }
  )
)