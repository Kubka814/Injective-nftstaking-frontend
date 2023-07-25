import { Wallet, WalletStrategy } from '@injectivelabs/wallet-ts'
import { ChainId, EthereumChainId } from "@injectivelabs/ts-types";

const IS_TESTNET = true
export const alchemyRpcEndpoint =
  IS_TESTNET
    ? `https://eth-goerli.alchemyapi.io/v2/`
    : `https://eth-mainnet.alchemyapi.io/v2/`
    // ? `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_KEY}`
    // : `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
// export const alchemyKey = (
//   IS_TESTNET || IS_DEVNET ? ALCHEMY_GOERLI_KEY : ALCHEMY_KEY
// ) as string

export const walletStrategy = new WalletStrategy({
  chainId: ChainId.Testnet,
  ethereumOptions: {
    ethereumChainId: EthereumChainId.Goerli,
    rpcUrl: alchemyRpcEndpoint
  },
  disabledWallets: [Wallet.WalletConnect, Wallet.CosmostationEth]
})
