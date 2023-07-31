import { fromInjectiveEthereumChainToCosmosChain, Network } from "@delphi-labs/shuttle-react";
import { bech32 } from "bech32";
import { Address } from "ethereumjs-util";

import { ChainGrpcBankApi, ChainGrpcWasmApi, IndexerGrpcOracleApi } from "@injectivelabs/sdk-ts";
import { Network as InjectiveNetworks, getNetworkEndpoints } from "@injectivelabs/networks";

export const INJECTIVE_TESTNET: Network = {
  name: "Injective Testnet",
  chainId: "injective-888",
  chainPrefix: "inj",
  rpc: "https://multichain-nodes.astroport.fi/injective-888/rpc/",
  rest: "https://multichain-nodes.astroport.fi/injective-888/lcd/",
  defaultCurrency: {
    coinDenom: "INJ",
    coinMinimalDenom: "inj",
    coinDecimals: 18,
    coinGeckoId: "injective",
  },
  gasPrice: "0.0005inj",
  evm: {
    deriveCosmosAddress: (ethAddress: string): string => {
      const addressBuffer = Address.fromString(ethAddress.toString()).toBuffer();

      return bech32.encode("inj", bech32.toWords(addressBuffer));
    },
    fromEthChainToCosmosChain: (chainId: number): string => {
      return fromInjectiveEthereumChainToCosmosChain(chainId);
    },
  },
};

export const INJECTIVE_MAINNET: Network = {
  name: "Injective Mainnet",
  chainId: "injective-1",
  chainPrefix: "inj",
  rpc: "https://multichain-nodes.astroport.fi/injective-1/rpc/",
  rest: "https://multichain-nodes.astroport.fi/injective-1/lcd/",
  defaultCurrency: {
    coinDenom: "INJ",
    coinMinimalDenom: "inj",
    coinDecimals: 18,
    coinGeckoId: "injective",
  },
  gasPrice: "0.0005inj",
  evm: {
    deriveCosmosAddress: (ethAddress: string): string => {
      const addressBuffer = Address.fromString(ethAddress.toString()).toBuffer();

      return bech32.encode("inj", bech32.toWords(addressBuffer));
    },
    fromEthChainToCosmosChain: (chainId: number): string => {
      return fromInjectiveEthereumChainToCosmosChain(chainId);
    },
  },
};

export const networks = [
  INJECTIVE_MAINNET,
  INJECTIVE_TESTNET,
];

const NETWORK = InjectiveNetworks.Mainnet;
const ENDPOINTS = getNetworkEndpoints(NETWORK);
export const chainGrpcWasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc);
export const indexerGrpcOracleApi = new IndexerGrpcOracleApi(ENDPOINTS.indexer);

const TEST_NETWORK = InjectiveNetworks.TestnetK8s;
const TEST_ENDPOINTS = getNetworkEndpoints(TEST_NETWORK);
export const test_chainGrpcWasmApi = new ChainGrpcWasmApi(TEST_ENDPOINTS.grpc);
export const test_chainGrpcBankApi = new ChainGrpcBankApi(TEST_ENDPOINTS.grpc);