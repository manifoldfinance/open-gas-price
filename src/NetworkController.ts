import { BaseController, BaseConfig, BaseState } from './BaseController';

/**
 * Human-readable network name
 */
export type NetworkType =
  | 'kovan'
  | 'localhost'
  | 'mainnet'
  | 'rinkeby'
  | 'goerli'
  | 'ropsten'
  | 'rpc'
  | 'optimism'
  | 'optimismTest';

export enum NetworksChainId {
  mainnet = '1',
  kovan = '42',
  rinkeby = '4',
  goerli = '5',
  ropsten = '3',
  localhost = '',
  rpc = '',
  optimism = '10',
  optimismTest = '69',
}

/**
 * @type ProviderConfig
 *
 * Configuration passed to web3-provider-engine
 * @property rpcTarget - RPC target URL.
 * @property type - Human-readable network name.
 * @property chainId - Network ID as per EIP-155.
 * @property ticker - Currency ticker.
 * @property nickname - Personalized network name.
 */
export interface ProviderConfig {
  rpcTarget?: string;
  type: NetworkType;
  chainId: string;
  ticker?: string;
  nickname?: string;
}

export interface Block {
  baseFeePerGas?: string;
}

export interface NetworkProperties {
  isEIP1559Compatible?: boolean;
}

/**
 * @type NetworkConfig
 *
 * Network controller configuration
 * @property infuraProjectId - an Infura project ID
 * @property providerConfig - web3-provider-engine configuration
 */
export interface NetworkConfig extends BaseConfig {
  infuraProjectId?: string;
  providerConfig: ProviderConfig;
}

/**
 * @type NetworkState
 *
 * Network controller state
 * @property network - Network ID as per net_version
 * @property isCustomNetwork - Identifies if the network is a custom network
 * @property provider - RPC URL and network name provider settings
 */
export interface NetworkState extends BaseState {
  network: string;
  isCustomNetwork: boolean;
  provider: ProviderConfig;
  properties: NetworkProperties;
}

const LOCALHOST_RPC_URL = 'http://localhost:8545';
