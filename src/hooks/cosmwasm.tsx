import { useState } from 'react'
// import { connectKeplr } from '../services/keplr'
import {  connect, getAddresses } from '../services/wallet'
import {  confirmCorrectKeplrAddress } from '../services/cosmos'
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

import { BigNumber, BigNumberInBase, BigNumberInWei, sleep } from '@injectivelabs/utils';
import { Web3Exception } from '@injectivelabs/exceptions';
import { MsgBroadcaster, WalletStrategy, Wallet } from "@injectivelabs/wallet-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";

const TEST_NETWORK = Network.TestnetK8s;
const TEST_ENDPOINTS = getNetworkEndpoints(TEST_NETWORK);
const test_chainGrpcWasmApi = new ChainGrpcWasmApi(TEST_ENDPOINTS.grpc);
const test_chainGrpcBankApi = new ChainGrpcBankApi(TEST_ENDPOINTS.grpc);

const NETWORK = Network.Mainnet;
const ENDPOINTS = getNetworkEndpoints(NETWORK);
const chainGrpcWasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc);
const indexerGrpcOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.indexer);

const tokenUris: Array<any> = []

export interface ICosmWasmContext {
  injectiveAddress: string;
  ethereumAddress: string;

  loading: boolean,
  connectWallet: Function,
  disconnect: Function,
  getConfig: Function,

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

  getTotalEarned: Function,
  totalEarned: number,

  getBalances: Function,
  nativeBalance: BigNumber,
  loadingNfts: boolean,
  setAccountNfts: Function,
  accountNfts: any,

  getUsdPrice: Function,
  usdPrice: number,

  executeStake: Function,
  executeRestake: Function,
  executeUnstake: Function,
  executeClaim: Function,

  loadingStaked: boolean,
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

export const useCosmWasmValue = (): ICosmWasmContext => {
  const WALLET_TPYE_KEPLR = 0
  const WALLET_TYPE_METAMASK = 1

  const [injectiveAddress, setInjectiveAddress] = useState('')
  const [ethereumAddress, setEthereumAddress] = useState('')

  const [loading, setLoading] = useState(false)

  const [nativeBalance, setNativeBalance] = useState<BigNumber>(BigNumber(0))
  const [accountNfts, setAccountNfts] = useState<Array<any>>([])
  const [loadingNfts, setLoadingNfts] = useState(false)
  const [usdPrice, setUsdPrice] = useState<number>(1)
  const [totalEarned, setTotalEarned] = useState(0)
  
  const [airdropableAmount, setAirdropableAmount] = useState<BigNumber>(BigNumber(0))
  const [lockNftCount, setLockNftCount] = useState(0)
  
  const [msgBroadcastClient, setMsgBroadcastClient] = useState<MsgBroadcaster>()

  const [totalNfts, setTotalNfts] = useState(0)
  const [totalStaked, setTotalStaked] = useState(0)
  const [totalAirdrop, setTotalAirdrop] = useState(0)
  const [lastTime, setLastTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [owner, setOwner] = useState('')
  const [collection, setCollection] = useState('')
  const [locktimeFee, setLocktimeFee] = useState(0)
  const [feeAddr, setFeeAddr] = useState('')
  const [localTime, setLocalTime] = useState(0)

  const [stakedNfts, setStakedNfts] = useState([])
  const [loadingStaked, setLoadingStaked] = useState(false)
  
  /***********    connect & disconnect wallet    **********/
  const connectWallet = async (walletType: number) => {
    setLoading(true)

    try {
      if (walletType == WALLET_TPYE_KEPLR) {
        const wallet: Wallet = Wallet.Keplr
        await connect({ wallet })
        if (!(window as any).getOfflineSigner || !(window as any).keplr) {
          toast.error("Install keplr wallet")
          return
        }
        await (window as any).keplr.enable(import.meta.env.VITE_PUBLIC_CHAIN_ID)
    
        // let walletStrategy = new WalletStrategy({
        //   chainId: import.meta.env.VITE_PUBLIC_CHAIN_ID
        // });
        // setMsgBroadcastClient(new MsgBroadcaster({
        //   walletStrategy,
        //   network: TEST_NETWORK,
        // }));

        const injectiveAddresses = await getAddresses();
        
        if (injectiveAddresses.length === 0) {
          throw new Web3Exception(
            new Error("There are no addresses linked in this wallet.")
          );
        }
        const [injectiveAddress] = injectiveAddresses
        await confirmCorrectKeplrAddress(injectiveAddress)

        setEthereumAddress('')
        setInjectiveAddress(injectiveAddress)

        localStorage.setItem("address", injectiveAddress)
        localStorage.setItem("wallet_type", 'keplr')

      } else if (walletType == WALLET_TYPE_METAMASK) {
        const wallet: Wallet = Wallet.Metamask
        await connect({ wallet })
        if (!(window as any).ethereum) {
          toast.error("Install keplr metamask")
          return
        }
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: import.meta.env.VITE_PUBLIC_ETHEREUM_CHAIN_ID}],
        });
        
        const addresses = await getAddresses();
        if (addresses.length === 0) {
          throw new Web3Exception(
            new Error("There are no addresses linked in this wallet.")
          );
        }
        const [address] = addresses
        setEthereumAddress(address)
        setInjectiveAddress(getInjectiveAddress(address))

        localStorage.setItem("address", address)
        localStorage.setItem("wallet_type", 'metamask')
      }
      
    } catch (error) {
      console.log(false, `Connect error : ${error}`)
    }
    setLoading(false)
  }

  const disconnect = () => {
    localStorage.removeItem("address")
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
  const getBalances = async (reload: boolean) => {
    
    if (loadingNfts || injectiveAddress.length == 0) return

    setLoadingNfts(true)
    try {
      const balance = await test_chainGrpcBankApi.fetchBalance({
        accountAddress: injectiveAddress, 
        denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM
      })
      setNativeBalance(new BigNumberInWei(balance.amount).toBase())

      if (reload) {
        const nftsArray:any = []
        let start_after:string = '0'
        while (1) {
          const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
            import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
            toBase64({
              tokens: {
                owner: injectiveAddress,
                start_after: start_after,
                limit: 30
              }
            })
          );
          if (response) {
            const result = fromBase64(response.data)
            if (result.tokens.length == 0) break
            result.tokens.forEach((token_id: string) => {
              nftsArray.push({token_id: token_id, nft_info: {token_uri: ''}})
              start_after = token_id
            })
          }else{
            break
          }
        }
        let diff = false
        if (accountNfts.length == nftsArray.length){
          for (let index = 0; index < nftsArray.length; ++index) {
            if (accountNfts[index].token_id != nftsArray[index].token_id){
              diff = true
              break
            }
          }
          if (!diff){
            setLoadingNfts(false)
            return
          }
        }

        let load_count = 0
        let currentTime = new Date()
        let start = currentTime.getTime()
        for (let index = 0; index < nftsArray.length; ++index) {
          // let exist = tokenUris.findIndex((token: any) => {
          //   return (token.token_id == nftsArray[index].token_id)
          // })
          // if (exist < 0) {
            /* let response_nft:any = await test_chainGrpcWasmApi.fetchSmartContractState(
              import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
              toBase64({
                all_nft_info: {
                  "token_id": nftsArray[index].token_id
                }
              })
            )
            if (response_nft) {
              const nftInfo = fromBase64(response_nft.data)
              nftsArray[index].nft_info.token_uri = nftInfo.info.token_uri
              tokenUris.push({token_id: nftsArray[index].token_id, token_uri: nftInfo.info.token_uri})
            } */
            test_chainGrpcWasmApi.fetchSmartContractState(
              import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
              toBase64({
                all_nft_info: {
                  "token_id": nftsArray[index].token_id
                }
              })
            ).then((response_nft: any) => {
              const nftInfo = fromBase64(response_nft.data)
              nftsArray[index].nft_info.token_uri = nftInfo.info.token_uri
              //tokenUris.push({token_id: nftsArray[index].token_id, token_uri: nftInfo.info.token_uri})
              load_count ++
              
              if (load_count == nftsArray.length){
                setAccountNfts(nftsArray)
                currentTime = new Date()
                setLoadingNfts(false)
                let end = currentTime.getTime()
                console.log(`elapsed time: ${end-start}`)
              }
              console.log(load_count);
            })
          // } else {
          //   nftsArray[index].nft_info.token_uri = tokenUris[exist].token_uri
          //   load_count ++
          // }
        }
      }
    } catch (error) {
    }
  }

  /******* Get Total Earned *******/
  const getTotalEarned = async () => {
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
  }

  /******* Get Airdropable Amount *******/
  const getAirdropableAmount = async () => {
    try {
      const balance = await test_chainGrpcBankApi.fetchBalance({
        accountAddress: import.meta.env.VITE_PUBLIC_STAKING_CONTRACT, 
        denom: import.meta.env.VITE_PUBLIC_STAKING_DENOM
      })
      setAirdropableAmount(new BigNumberInWei(balance.amount).toBase())
    } catch (error) {
    }
  }

  /******* Get Airdropable Amount *******/
  const getLockNftCount = async () => {
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
  }

  /******* Get Config *******/
  const getConfig = async () => {
    try {
      const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_STAKING_CONTRACT,
        toBase64({ 
          get_config: {} 
        })
      )

      if (response) {
        const result = fromBase64(response.data)

        setCollection(result.collection_address)
        setCurrentTime(result.current_time)
        setDuration(result.duration)
        setLastTime(result.last_airdrop_time)
        setOwner(result.owner)
        setTotalStaked(parseInt(result.total_staked))
        setTotalAirdrop( new BigNumberInWei(result.total_airdrop).toBase().toNumber())
        setLocktimeFee(new BigNumberInWei(result.locktime_fee).toBase().toNumber())
        setFeeAddr(result.fee_address)
        setLocalTime(Math.floor(Date.now()/1000))

      }
    } catch (error) {
      console.log(false, `Get Config error : ${error}`)
    }

    try {
      const response:any = await chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_ALIEN_COLLECTION,
        toBase64({ 
          num_tokens: {} 
        })
      )
      if (response) {
        const result = fromBase64(response.data)
        setTotalNfts(result.count)
      }
    } catch (error) {
      console.log(false, `Get Config error : ${error}`)
    }
  }

  /******* Execute Stake Nft Token *******/
  const executeStake = async (nft_ids:Array<string>) => {
    if (injectiveAddress.length == 0) return
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
        getBalances(true)
        getStakedNfts()
        toast.success("Stake Successed")
      }
    } catch (error) {
      toast.error("Stake Failed")
      console.log(false, `Stake Error : ${error}`)
    }
  }

  /******* Execute Stake Nft Token *******/
  const executeRestake = async (nft_id:string) => {
    if (injectiveAddress.length == 0) return
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
  }

  /******* Execute Claim Nft Token *******/
  const executeClaim = async (nft_ids:Array<string>) => {
    if (injectiveAddress.length == 0) return
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
        getBalances(false)
        getStakedNfts()
        getTotalEarned()
        toast.success("Claim Successed")
      }
    } catch (error) {
      console.log(false, `Claim Error : ${error}`)
      toast.error("Claim Failed")
    }
  }

  /******* Execute UnStake Nft Token *******/
  const executeUnstake = async (nft_ids:Array<string>) => {
    if (injectiveAddress.length == 0) return
    try {
      const msgs = new Array<Msgs>
      nft_ids.map((nft_id) => {
        let nftinfo: any = stakedNfts.find((nft:any) => (nft.token_id == nft_id))
        if (!nftinfo) return
        let feeAmount = '0'
        if (nftinfo.lock_time > currentTime && locktimeFee) {
          feeAmount = new BigNumberInBase(locktimeFee).toWei().toFixed()
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
        getBalances(true)
        getStakedNfts()
        toast.success("Unstake Successed")
      }
    } catch (error) {
      toast.error("Unstake Failed")
      console.log(false, `UnStake Error : ${error}`)
    }
  }

  /******* Execute Airdrop *******/
  const executeAirdrop = async (amount:number) => {
    if (injectiveAddress.length == 0 || (injectiveAddress != owner)) return
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
  }

  /******* Execute Update Config Token *******/
  const executeAirdropRestart = async () => {
    if (injectiveAddress.length == 0 ||  (injectiveAddress != owner)) return
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
  }

  /******* Execute Update Config *******/
  const executeUpdateConfig = async (updateInfo:any) => {
    if (injectiveAddress.length == 0 ||  (injectiveAddress != owner)) return
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
  }

  /******* Execute Withdraw *******/
  const executeWithdraw = async (amount:number) => {
    if (injectiveAddress.length == 0 ||  (injectiveAddress != owner)) return
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
        getBalances(false)
        getAirdropableAmount()
      }
    } catch (error) {
      toast.error("Withdraw Failed")
      console.log(false, `UpdateConfig Error : ${error}`)
    }
  }

  /******* Execute Charge Airdrop *******/
  const executeCharge = async (amount:number) => {
    if (injectiveAddress.length == 0) return
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
        getBalances(false)
        getAirdropableAmount()
      }
    } catch (error) {
      toast.error("Charge Airdrop Failed")
      console.log(false, `Charge Airdrop Error : ${error}`)
    }
  }

  /*********    Get Staked NFTs    ************/
  const getStakedNfts = async () => {
    if (loadingStaked == true || injectiveAddress.length == 0) return
    setLoadingStaked(true)
    try {
      const response:any = await test_chainGrpcWasmApi.fetchSmartContractState(
        import.meta.env.VITE_PUBLIC_STAKING_CONTRACT, 
        toBase64({
          staked_nfts: {
            address: injectiveAddress
          }
        })
      )

      const nftsArray:any = []
      if (response) {
        const result = fromBase64(response.data)
        result.nft_maps.forEach((nft: any) => {
          nftsArray.push({
            token_id: nft.nft_id, 
            lock_time: nft.lock_time,
            airdrop: new BigNumberInWei(nft.airdrop).toBase(), 
            nft_info: {
              token_uri: ''
            }
          })
        })

        for (let index = 0; index < nftsArray.length; ++index) {
          let exist = tokenUris.findIndex((token: any) => {
            return (token.token_id == nftsArray[index].token_id)
          })

          if (exist < 0) {
            let response_nft:any = await test_chainGrpcWasmApi.fetchSmartContractState(
              import.meta.env.VITE_PUBLIC_COLLECTION_CONTRACT, 
              toBase64({
                all_nft_info: {
                  "token_id": nftsArray[index].token_id
                }
              })
            )
            if (response_nft) {
              const nftInfo = fromBase64(response_nft.data)
              nftsArray[index].nft_info.token_uri = nftInfo.info.token_uri
              tokenUris.push({token_id: nftsArray[index].token_id, token_uri: nftInfo.info.token_uri})
            }
          } else {
            nftsArray[index].nft_info.token_uri = tokenUris[exist].token_uri
          }
        }

        setStakedNfts(nftsArray)
      }
    } catch (error) {
    }
    setLoadingStaked(false)
  }

  return {
    injectiveAddress,
    ethereumAddress,
    loading,
    connectWallet,
    disconnect,
    getConfig,

    totalNfts,
    totalStaked,
    totalAirdrop,
    lastTime,
    currentTime,
    duration,
    owner,
    collection,
    locktimeFee,
    feeAddr,
    localTime,

    getTotalEarned,
    totalEarned,

    getBalances,
    nativeBalance,
    setAccountNfts,
    loadingNfts,
    accountNfts,

    getUsdPrice,
    usdPrice,

    executeStake,
    executeRestake,
    executeUnstake,
    executeClaim,

    getStakedNfts,
    loadingStaked,
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
