import { useState } from 'react'
import { connectKeplr } from '../services/keplr'

import {
  Msgs,
  MsgSend,
  MsgExecuteContractCompat,
  toBase64,
  fromBase64,
  ChainGrpcWasmApi,
  ChainGrpcBankApi,
  getInjectiveAddress,
  IndexerGrpcOracleApi 
} from "@injectivelabs/sdk-ts";

import { toast } from 'react-toastify';

import { BigNumber, BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils';
import { Web3Exception } from '@injectivelabs/exceptions';
import { MsgBroadcaster, WalletStrategy } from "@injectivelabs/wallet-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";

const TEST_NETWORK = Network.TestnetK8s;
const TEST_ENDPOINTS = getNetworkEndpoints(TEST_NETWORK);
const test_chainGrpcWasmApi = new ChainGrpcWasmApi(TEST_ENDPOINTS.grpc);
const test_chainGrpcBankApi = new ChainGrpcBankApi(TEST_ENDPOINTS.grpc);

const NETWORK = Network.MainnetK8s;
const ENDPOINTS = getNetworkEndpoints(NETWORK);
const chainGrpcWasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc);
const indexerGrpcOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.indexer);

export interface ISigningCosmWasmClientContext {
  injectiveAddress: string;
  ethereumAddress: string;

  loading: boolean,
  connectWallet: Function,
  disconnect: Function,

  getConfig: Function,
  config: {
    totalNfts: number,
    totalStaked: number,
    totalAirdrop: number,
    lastTime: number,
    currentTime: number,
    duration: number,
    owner: string,
    collection: string,
    locktimeFee: number,
    feeAddr: string,
    localTime: number,
  },
  isAdmin: boolean,

  getTotalEarned: Function,
  totalEarned: number,

  getBalances: Function,
  nativeBalance: BigNumber,
  accountNfts: any,

  getUsdPrice: Function,
  usdPrice: number,

  executeStake: Function,
  executeRestake: Function,
  executeUnstake: Function,
  executeClaim: Function,

  getStakedNfts: Function,
  stakedNfts: any,

  getAirdropableAmount: Function,
  airdropableAmount: BigNumber,

  getLockNftCount: Function,
  lockNftCount: number,

  executeAirdrop: Function,
  executeCharge: Function,
  executeUpdateConfig: Function,
  executeAirdropRestart: Function,
  executeWithdraw: Function,
}

export const useSigningCosmWasmClient = (): ISigningCosmWasmClientContext => {
  const WALLET_TPYE_KEPLR = 0
  const WALLET_TYPE_METAMASK = 1

  const [injectiveAddress, setInjectiveAddress] = useState('')
  const [ethereumAddress, setEthereumAddress] = useState('')

  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const [nativeBalance, setNativeBalance] = useState<BigNumber>(BigNumber(0))
  const [accountNfts, setAccountNfts] = useState([])
  const [usdPrice, setUsdPrice] = useState<number>(1)
  const [totalEarned, setTotalEarned] = useState(0)
  
  const [airdropableAmount, setAirdropableAmount] = useState<BigNumber>(BigNumber(0))
  const [lockNftCount, setLockNftCount] = useState(0)
  
  const [msgBroadcastClient, setMsgBroadcastClient] = useState<MsgBroadcaster>()

  const [config, setConfig] = useState({ 
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
  })
  const [stakedNfts, setStakedNfts] = useState([])
  
  /***********    connect & disconnect wallet    **********/
  const connectWallet = async (walletType: number) => {
    setLoading(true)

    try {
      if (walletType == WALLET_TPYE_KEPLR) {
        await connectKeplr()
        if (!(window as any).getOfflineSigner || !(window as any).keplr) {
          toast.error("Install keplr wallet")
          return
        }
        await (window as any).keplr.enable(import.meta.env.VITE_PUBLIC_CHAIN_ID)
        
        let walletStrategy = new WalletStrategy({
          chainId: import.meta.env.VITE_PUBLIC_CHAIN_ID
        });
        setMsgBroadcastClient(new MsgBroadcaster({
          walletStrategy,
          network: TEST_NETWORK,
        }));

        const addresses = await walletStrategy.getAddresses();
        if (addresses.length === 0) {
          throw new Web3Exception(
            new Error("There are no addresses linked in this wallet.")
          );
        }
        setEthereumAddress('')
        setInjectiveAddress(addresses[0])

        setIsAdmin(addresses[0] == config.owner)
        localStorage.setItem("address", addresses[0])
        localStorage.setItem("wallet_type", 'keplr')

      } else if (walletType == WALLET_TYPE_METAMASK) {
        if (!(window as any).ethereum) {
          toast.error("Install keplr metamask")
          return
        }
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: import.meta.env.VITE_PUBLIC_ETHEREUM_CHAIN_ID}],
        });

        let walletStrategy = new WalletStrategy({
          chainId: import.meta.env.VITE_PUBLIC_CHAIN_ID,
          ethereumOptions: {
            ethereumChainId: import.meta.env.VITE_PUBLIC_ETHEREUM_CHAIN_ID,
            rpcUrl: import.meta.env.VITE_PUBLIC_ALCHEMY_RPC_ENDPOINT,
          },
        });
        setMsgBroadcastClient(new MsgBroadcaster({
          walletStrategy,
          network: TEST_NETWORK,
        }));

        const addresses = await walletStrategy.getAddresses();
        if (addresses.length === 0) {
          throw new Web3Exception(
            new Error("There are no addresses linked in this wallet.")
          );
        }
        setEthereumAddress(addresses[0])
        setInjectiveAddress(getInjectiveAddress(addresses[0]))

        setIsAdmin(addresses[0] == config.owner)
        localStorage.setItem("address", addresses[0])
        localStorage.setItem("wallet_type", 'metamask')
      }
      
    } catch (error) {
      console.log(false, `Connect error : ${error}`)
    }
    setLoading(false)
  }

  const disconnect = () => {
    localStorage.removeItem("address")
    setIsAdmin(false)
    setInjectiveAddress('')
    setStakedNfts([])
    setAccountNfts([])
    setLoading(false)
  }

  const getUsdPrice = async () => {
    const baseSymbol = "INJ";
    const quoteSymbol = "USDT";
    const oracleType = "bandibc";

    const oraclePrice = await indexerGrpcOracleApi.fetchOraclePriceNoThrow({
      baseSymbol,
      quoteSymbol,
      oracleType,
    });

    setUsdPrice(parseInt(oraclePrice.price));
  }

  /******* Get Account Balances *******/
  const getBalances = async () => {
    setLoading(true)
    try {
      const balance = await test_chainGrpcBankApi.fetchBalance({
        accountAddress: injectiveAddress, 
        denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM
      })
      setNativeBalance(new BigNumberInWei(balance.amount).toBase())

      const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
        toBase64({
          tokens: {
            owner: injectiveAddress,
            start_after: '0',
            limit: 30
          }
        })
      );

      if (response) {
        const result = fromBase64(response.data)
        const nftsArray:any = []
        await Promise.all(result.tokens.map(async (token_id:string) => {
          let reponse_nftInfo:any = await test_chainGrpcWasmApi.fetchSmartContractState(
            import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
            toBase64({
              all_nft_info: {
                "token_id": token_id
              }
            })
          );
          const nftInfo = fromBase64(reponse_nftInfo.data)
          nftsArray.push({token_id: token_id, nft_info: nftInfo})
        }));
        setAccountNfts(nftsArray)
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  /******* Get Total Earned *******/
  const getTotalEarned = async () => {
    setLoading(true)
    try {
      const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_STAKING_CONTRACT, 
        toBase64({
          get_total_earned: {
            address: injectiveAddress
          }
        })
      );
      if (response) {
        const result = fromBase64(response.data)
        setTotalEarned(new BigNumberInWei(result.total_earned).toBase().toNumber())
      }
    } catch (error) {
    }
    setLoading(false)
  }

  /******* Get Airdropable Amount *******/
  const getAirdropableAmount = async () => {
    setLoading(true)
    try {
      const balance = await test_chainGrpcBankApi.fetchBalance({
        accountAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT, 
        denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM
      })
      setAirdropableAmount(new BigNumberInWei(balance.amount).toBase())
    } catch (error) {
    }
    setLoading(false)
  }

  /******* Get Airdropable Amount *******/
  const getLockNftCount = async () => {
    setLoading(true)
    try {
      const response: any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        toBase64({
          get_total_locked: {}
        })
      )
      if (response) {
        const result = fromBase64(response.data)
        setLockNftCount(result.count)
      }
    } catch (error) {
    }
    setLoading(false)
  }

  /******* Get Config *******/
  const getConfig = async () => {
    setLoading(true)
    try {
      let load = {
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
      }
      
      let response: any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        toBase64({ 
          get_config: {} 
        })
      );

      if (response) {
        const result = fromBase64(response.data)
        load.collection = result.collection_address
        load.currentTime = result.current_time
        load.duration = result.duration
        load.lastTime = result.last_airdrop_time
        load.owner = result.owner
        load.totalStaked = parseInt(result.total_staked)
        load.totalAirdrop =  new BigNumberInWei(result.total_airdrop).toBase().toNumber()
        load.locktimeFee = new BigNumberInWei(result.locktime_fee).toBase().toNumber()
        load.feeAddr = result.fee_address

        setIsAdmin(load.owner == injectiveAddress)
      }

      response = await chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_ALIEN_COLLECTION,
        toBase64({ 
          num_tokens: {} 
        })
      );

      if (response) {
        const result = fromBase64(response.data)
        load.totalNfts = result.count
      }
      load.localTime = Math.floor(Date.now() / 1000)

      setConfig(load)
    } catch (error) {
      console.log(false, `getConfig error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Stake Nft Token *******/
  const executeStake = async (nft_ids:Array<string>) => {
    if (loading == true || injectiveAddress.length == 0) return
    setLoading(true)
    try {
      const msgs = new Array<Msgs>

      nft_ids.map((nft_id) => {
        const send_msg = {
          stake: {
            sender: injectiveAddress,
            token_id: nft_id
          }
        };

        const msg = MsgExecuteContractCompat.fromJSON({
          sender: injectiveAddress,
          contractAddress: import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT,
          msg: {
            send_nft: {
              contract: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
              token_id: nft_id,
              msg: Buffer.from(JSON.stringify(send_msg)).toString('base64'),
            }
          },
        });

        msgs.push(msg)
      })

      const result = await msgBroadcastClient?.broadcast({
        msgs: msgs,
        injectiveAddress: injectiveAddress,
      }); 

      if (result && result.txHash) {
        getBalances()
        getStakedNfts()
        toast.success("Stake Successed")
      }
    } catch (error) {
      toast.error("Stake Failed")
      console.log(false, `Stake Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Stake Nft Token *******/
  const executeRestake = async (nft_id:string) => {
    if (loading == true || injectiveAddress.length == 0) return
    setLoading(true)
    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        sender: injectiveAddress,
        contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        msg: {
          restake: {
            restake_nft_id: nft_id,
          }
        },
      });

      const result:any = await msgBroadcastClient?.broadcast({
        msgs: msg,
        injectiveAddress: injectiveAddress,
      }); 

      if (result && result.txHash) {
        getStakedNfts()
        toast.success("Restake Successed")
      }

    } catch (error) {
      console.log(false, `Restake Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Claim Nft Token *******/
  const executeClaim = async (nft_ids:Array<string>) => {
    if (loading == true || injectiveAddress.length == 0) return
    setLoading(true)
    try {
      const msgs = new Array<Msgs>
      nft_ids.map((nft_id) => {
        const msg = MsgExecuteContractCompat.fromJSON({
          sender: injectiveAddress,
          contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
          msg: {
            claim: {
              claim_nft_id: nft_id,
            }
          },
        });
        msgs.push(msg)
      })

      const result:any = await msgBroadcastClient?.broadcast({
        msgs: msgs,
        injectiveAddress: injectiveAddress,
      }); 
      
      if (result && result.txHash) {
        getBalances()
        getStakedNfts()
        getTotalEarned()
        toast.success("Claim Successed")
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(false, `Claim Error : ${error}`)
      toast.error("Claim Failed")
    }
  }

  /******* Execute UnStake Nft Token *******/
  const executeUnstake = async (nft_ids:Array<string>) => {
    if (loading == true || injectiveAddress.length == 0) return
    setLoading(true)
    try {
      const msgs = new Array<Msgs>
      nft_ids.map((nft_id) => {
        let nftinfo: any = stakedNfts.find((nft:any) => (nft.token_id == nft_id))
        if (!nftinfo) return
        let feeAmount = '0'
        if (nftinfo.lock_time > config.currentTime && config.locktimeFee) {
          feeAmount = new BigNumberInBase(config.locktimeFee).toWei().toFixed()
        }

        const msg = MsgExecuteContractCompat.fromJSON({
          sender: injectiveAddress,
          contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
          msg: {
            unstake: {
              unstake_nft_id: nft_id,
            }
          },
          funds: {
            denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
            amount: feeAmount
          }
        });
        msgs.push(msg)
      })

      const result = await msgBroadcastClient?.broadcast({
        msgs: msgs,
        injectiveAddress: injectiveAddress,
      }); 
     
      if (result && result.txHash) {
        getBalances()
        getStakedNfts()
        toast.success("Unstake Successed")
      }
    } catch (error) {
      toast.error("Unstake Failed")
      console.log(false, `UnStake Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Airdrop *******/
  const executeAirdrop = async (amount:number) => {
    if (loading == true || injectiveAddress.length == 0 || !isAdmin) return
    setLoading(true)
    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        sender: injectiveAddress,
        contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        msg: {
          airdrop: {
            airdrop_amount: new BigNumberInBase(amount).toWei().toFixed(),
          }
        },
      });

      const result = await msgBroadcastClient?.broadcast({
        msgs: msg,
        injectiveAddress: injectiveAddress,
      }); 
     
      if (result && result.txHash) {
        toast.success("Airdrop Successed")
        getAirdropableAmount()
        getConfig()
      }
    } catch (error) {
      toast.error("Airdrop Failed")
      console.log(false, `Airdrop  Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Update Config Token *******/
  const executeAirdropRestart = async () => {
    if (loading == true || injectiveAddress.length == 0 || !isAdmin) return
    setLoading(true)
    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        sender: injectiveAddress,
        contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        msg: {
          airdrop_restart: {
          }
        },
      });

      const result = await msgBroadcastClient?.broadcast({
        msgs: msg,
        injectiveAddress: injectiveAddress,
      }); 

      if (result && result.txHash) {
        toast.success("Airdrop Restart Successed")
        getConfig()
      }
    } catch (error) {
      toast.error("Airdrop Restart Failed")
      console.log(false, `Airdrop Restart Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Update Config *******/
  const executeUpdateConfig = async (updateInfo:any) => {
    if (loading == true || injectiveAddress.length == 0 || !isAdmin) return
    setLoading(true)
    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        sender: injectiveAddress,
        contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        msg: {
          update_config: {
            new_owner: updateInfo.owner,
            new_fee_address: updateInfo.feeAddr,
            new_collection_address: updateInfo.collectionAddr,
            new_duration: parseInt(updateInfo.duration),
            new_locktime_fee: new BigNumberInBase(updateInfo.locktimeFee).toWei().toFixed(),
          }
        },
      });

      const result = await msgBroadcastClient?.broadcast({
        msgs: msg,
        injectiveAddress: injectiveAddress,
      }); 

      if (result && result.txHash) {
        getConfig()
        toast.success("UpdateConfig Successed")
      }
    } catch (error) {
      toast.error("UpdateConfig Failed")
      console.log(false, `UpdateConfig Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Withdraw *******/
  const executeWithdraw = async (amount:number) => {
    if (loading == true || injectiveAddress.length == 0 || !isAdmin) return
    setLoading(true)
    try {
      const msg = MsgExecuteContractCompat.fromJSON({
        sender: injectiveAddress,
        contractAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        msg: {
          withdraw: {
            amount: new BigNumberInBase(amount).toWei().toFixed(),
          }
        },
      });

      const result = await msgBroadcastClient?.broadcast({
        msgs: msg,
        injectiveAddress: injectiveAddress,
      }); 

      if (result && result.txHash) {
        toast.success("Withdraw successed")
        getBalances()
        getAirdropableAmount()
      }
    } catch (error) {
      toast.error("Withdraw Failed")
      console.log(false, `UpdateConfig Error : ${error}`)
    }
    setLoading(false)
  }

  /******* Execute Charge Airdrop *******/
  const executeCharge = async (amount:number) => {
    if (loading == true || injectiveAddress.length == 0) return
    setLoading(true)
    try {
      const msg = MsgSend.fromJSON({
        srcInjectiveAddress: injectiveAddress,
        dstInjectiveAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        amount: {
          denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
          amount: new BigNumberInBase(amount).toWei().toFixed()
        }
      });

      const result = await msgBroadcastClient?.broadcast({
        msgs: msg,
        injectiveAddress: injectiveAddress,
      }); 
     
      if (result && result.txHash) {
        toast.success("Charge Airdrop Successed")
        getBalances()
        getAirdropableAmount()
      }
    } catch (error) {
      toast.error("Charge Airdrop Failed")
      console.log(false, `Charge Airdrop Error : ${error}`)
    }
    setLoading(false)
  }

  /*********    Get Staked NFTs    ************/
  const getStakedNfts = async () => {
    if (loading == true || injectiveAddress.length == 0) return
    setLoading(true)
    try {
      const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_STAKING_CONTRACT, 
        toBase64({
          staked_nfts: {
            address: injectiveAddress
          }
        })
      )

      if (response) {
        const result = fromBase64(response.data)
        const nftsArray:any = []
        await Promise.all(result.nft_maps.map(async (nft:any) => {
          const response_nftInfo:any = await test_chainGrpcWasmApi.fetchSmartContractState(
            import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
            toBase64({
              all_nft_info: {
                "token_id": nft.nft_id
              }
            })
          )
          if (response_nftInfo) {
            const nftInfo = fromBase64(response_nftInfo.data)
            nftsArray.push({
              token_id: nft.nft_id, 
              lock_time: nft.lock_time,
              airdrop: new BigNumberInWei(nft.airdrop).toBase(), 
              nft_info: nftInfo
            })
          }
        }));
        setStakedNfts(nftsArray)
      }
    } catch (error) {
      // console.log(false, `GetStakedNfts Error : ${error}`)
    }
    setLoading(false)
  }

  return {
    injectiveAddress,
    ethereumAddress,
    loading,
    connectWallet,
    disconnect,
    getConfig,
    config,
    isAdmin,

    getTotalEarned,
    totalEarned,

    getBalances,
    nativeBalance,
    accountNfts,

    getUsdPrice,
    usdPrice,

    executeStake,
    executeRestake,
    executeUnstake,
    executeClaim,

    getStakedNfts,
    stakedNfts,

    getAirdropableAmount,
    airdropableAmount,

    getLockNftCount,
    lockNftCount,

    executeAirdrop,
    executeCharge,
    executeUpdateConfig,
    executeAirdropRestart,
    executeWithdraw
  }
}
