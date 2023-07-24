export const connectKeplr = async () => {
  if (!(window as any).getOfflineSigner || !(window as any).keplr) {
    alert('Please install keplr extension')
  } else {
    if ((window as any).keplr.experimentalSuggestChain) {
      try { // Prepare Keplr
        await (window as any).keplr.experimentalSuggestChain({
          chainId: import.meta.env.VITE_PUBLIC_CHAIN_ID,
          chainName: import.meta.env.VITE_PUBLIC_CHAIN_NAME,
          rpc: import.meta.env.VITE_PUBLIC_CHAIN_RPC_ENDPOINT,
          rest: import.meta.env.VITE_PUBLIC_CHAIN_REST_ENDPOINT,
          stakeCurrency: {
            coinDenom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
            coinMinimalDenom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
            coinDecimals: 0,
          },
          bip44: {
            coinType: 118,
          },
          bech32Config: {
            bech32PrefixAccAddr: import.meta.env.VITE_PUBLIC_CHAIN_BECH32_PREFIX,
            bech32PrefixAccPub: `${import.meta.env.VITE_PUBLIC_CHAIN_BECH32_PREFIX}pub`,
            bech32PrefixValAddr: `${import.meta.env.VITE_PUBLIC_CHAIN_BECH32_PREFIX}valoper`,
            bech32PrefixValPub: `${import.meta.env.VITE_PUBLIC_CHAIN_BECH32_PREFIX}valoperpub`,
            bech32PrefixConsAddr: `${import.meta.env.VITE_PUBLIC_CHAIN_BECH32_PREFIX}valcons`,
            bech32PrefixConsPub: `${import.meta.env.VITE_PUBLIC_CHAIN_BECH32_PREFIX}valconspub`,
          },
          currencies: [
            {
              coinDenom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
              coinMinimalDenom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
              coinDecimals: 0,
            },
          ],
          feeCurrencies: [
            {
              coinDenom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
              coinMinimalDenom: import.meta.env.VITE_PUBLIC_STAKING_DENOM,
              coinDecimals: 0,
            },
          ],
          coinType: 118,
          gasPriceStep: {
            low: 0.01,
            average: 0.025,
            high: 0.04,
          },
        })
      } catch {
        alert('Failed to suggest the chain')
      }
    } else {
      alert('Please use the recent version of keplr extension')
    }
  }
}
