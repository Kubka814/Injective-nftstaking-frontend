import { Wallet } from '@injectivelabs/wallet-ts'
import {
  ErrorType,
  UnspecifiedErrorCode,
  WalletException
} from '@injectivelabs/exceptions'
import { walletStrategy } from '../wallet-strategy'

export const connect = ({
  wallet
}: {
  wallet: Wallet
  // onAccountChangeCallback?: (account: string) => void,
}) => {
  walletStrategy.setWallet(wallet)
}

export const getAddresses = async (): Promise<string[]> => {
  const addresses = await walletStrategy.getAddresses()

  if (addresses.length === 0) {
    throw new WalletException(
      new Error('There are no addresses linked in this wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  if (!addresses.every((address) => !!address)) {
    throw new WalletException(
      new Error('There are no addresses linked in this wallet.'),
      {
        code: UnspecifiedErrorCode,
        type: ErrorType.WalletError
      }
    )
  }

  return addresses
}

export const confirm = async (address: string) => {
  return await walletStrategy.confirm(address)
}