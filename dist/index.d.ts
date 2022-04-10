import { BN } from 'ethereumjs-util';
import { GasFeeEstimates, LegacyGasPriceEstimate, EthGasPriceEstimate, EstimatedGasFeeTimeBounds } from '@metamask/controllers/dist/gas/GasFeeController';

declare type EthQuery$2 = any;
/**
 * Uses historical base fees to determine a threshold we can use to determine whether the network is
 * busy. Specifically, pulls the last 20,000 blocks (which at the time of this writing represents
 * around 2 days), sorts the base fees of those blocks, then chooses the base fee which is 9/10 of
 * the way into the list (i.e. the 90th percentile).
 *
 * @param ethQuery - An EthQuery instance.
 * @returns A promise for the 90th percentile base fee in WEI, as a BN.
 */
declare function calculateBusyThreshold(ethQuery: EthQuery$2): Promise<BN>;

declare const calculateBusyThreshold$1_calculateBusyThreshold: typeof calculateBusyThreshold;
declare namespace calculateBusyThreshold$1 {
  export {
    calculateBusyThreshold as default,
    calculateBusyThreshold$1_calculateBusyThreshold as calculateBusyThreshold,
  };
}

declare type EthQuery$1 = any;
declare type NetworkStatusInfo = {
    isNetworkBusy: boolean;
};
/**
 * Collects information about the status of the network. Right now the only piece of information is
 * whether the network is "busy" — i.e., whether the base fee for the latest block exceeds a
 * particular "busy" threshold.
 *
 * @param args - The arguments.
 * @param args.latestBaseFee - The base fee for the latest block in WEI.
 * @param args.url - The URL for the API used to determine a base fee threshold.
 * @param args.ethQuery - An EthQuery instance.
 * @param args.clientId - The ID of the client making this request.
 * @returns The network status info.
 */
declare function determineNetworkStatusInfo({ latestBaseFee, url, ethQuery, clientId, }: {
    latestBaseFee: BN;
    url: string;
    ethQuery: EthQuery$1;
    clientId: string | undefined;
}): Promise<NetworkStatusInfo>;

type determineNetworkStatusInfo$1_NetworkStatusInfo = NetworkStatusInfo;
declare namespace determineNetworkStatusInfo$1 {
  export {
    determineNetworkStatusInfo as default,
    determineNetworkStatusInfo$1_NetworkStatusInfo as NetworkStatusInfo,
  };
}

declare type EthQuery = any;
/**
 * @type EthFeeHistoryResponse
 *
 * Response data for `eth_feeHistory`.
 * @property oldestBlock - The id of the oldest block (in hex format) in the range of blocks
 * requested.
 * @property baseFeePerGas - Base fee per gas for each block in the range of blocks requested.
 * @property gasUsedRatio - A number between 0 and 1 that represents the gas used vs. gas limit for
 * each block in the range of blocks requested.
 * @property reward - The priority fee at the percentiles requested for each block in the range of
 * blocks requested.
 */
declare type EthFeeHistoryResponse = {
    oldestBlock: string;
    baseFeePerGas: string[];
    gasUsedRatio: number[];
    reward?: string[][];
};
/**
 * @type Block
 *
 * Historical data for a particular block.
 * @property number - The number of the block, as a BN.
 * @property baseFeePerGas - The base fee per gas for the block in WEI, as a BN.
 * @property gasUsedRatio - A number between 0 and 1 that represents the ratio between the gas paid
 * for the block and its set gas limit.
 * @property priorityFeesByPercentile - The priority fees paid for the transactions in the block
 * that occurred at particular levels at which those transactions contributed to the overall gas
 * used for the block, indexed by those percentiles. (See docs for {@link fetchBlockFeeHistory} for more
 * on how this works.)
 */
declare type Block<Percentile extends number> = {
    number: BN;
    baseFeePerGas: BN;
    gasUsedRatio: number;
    priorityFeesByPercentile: Record<Percentile, BN>;
};
/**
 * Uses `eth_feeHistory` (an EIP-1559 feature) to obtain information about gas fees from a range of
 * blocks that have occurred recently on a network.
 *
 * To learn more, see these resources:
 *
 * - <https://infura.io/docs/ethereum#operation/eth_feeHistory>
 * - <https://github.com/zsfelfoldi/feehistory/blob/main/docs/feeHistory.md>
 * - <https://github.com/ethereum/go-ethereum/blob/57a3fab8a75eeb9c2f4fab770b73b51b9fe672c5/eth/gasprice/feehistory.go#L180>
 * - <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md>
 * - <https://gas-api.metaswap.codefi.network/testFeeHistory>
 *
 * @param args - The arguments to this function.
 * @param args.ethQuery - An EthQuery instance that wraps a provider for the network in question.
 * @param args.endBlock - The desired end of the requested block range. Can be "latest" if you want
 * to start from the latest successful block or the number of a known past block.
 * @param args.numberOfBlocks - How many total blocks to fetch. Note that if this is more than 1024,
 * multiple calls to `eth_feeHistory` will be made.
 * @param args.percentiles - A set of numbers between 1 and 100 which will dictate how
 * `priorityFeesByPercentile` in each returned block will be formed. When Ethereum runs the
 * `eth_feeHistory` method, for each block it is considering, it will first sort all transactions by
 * the priority fee. It will then go through each transaction and add the total amount of gas paid
 * for that transaction to a bucket which maxes out at the total gas used for the whole block. As
 * the bucket fills, it will cross percentages which correspond to the percentiles specified here,
 * and the priority fees of the first transactions which cause it to reach those percentages will be
 * recorded. Hence, `priorityFeesByPercentile` represents the priority fees of transactions at key
 * gas used contribution levels, where earlier levels have smaller contributions and later levels
 * have higher contributions.
 * @returns The list of blocks and their fee data, sorted from oldest to newest.
 */
declare function fetchBlockFeeHistory<Percentile extends number>({ ethQuery, numberOfBlocks: totalNumberOfBlocks, endBlock: givenEndBlock, percentiles: givenPercentiles, }: {
    ethQuery: EthQuery;
    numberOfBlocks: number;
    endBlock?: 'latest' | BN;
    percentiles?: readonly Percentile[];
}): Promise<Block<Percentile>[]>;

type fetchBlockFeeHistory$1_EthFeeHistoryResponse = EthFeeHistoryResponse;
type fetchBlockFeeHistory$1_Block<Percentile extends number> = Block<Percentile>;
declare namespace fetchBlockFeeHistory$1 {
  export {
    fetchBlockFeeHistory as default,
    fetchBlockFeeHistory$1_EthFeeHistoryResponse as EthFeeHistoryResponse,
    fetchBlockFeeHistory$1_Block as Block,
  };
}

/**
 * Hits a URL that returns a base fee which represents a threshold we can use to determine whether
 * the network is busy.
 *
 * @param url - A URL.
 * @param clientId - The ID of the client making this request.
 * @returns A promise for a base fee in WEI, as a BN.
 */
declare function fetchBusyThreshold(url: string, clientId: string | undefined): Promise<BN>;

declare namespace fetchBusyThreshold$1 {
  export {
    fetchBusyThreshold as default,
  };
}

/**
 * Convert a decimal GWEI value to a decimal string rounded to the nearest WEI.
 *
 * @param n - The input GWEI amount, as a decimal string or a number.
 * @returns The decimal string GWEI amount.
 */
declare function normalizeGWEIDecimalNumbers(n: string | number): any;
/**
 * Fetch gas estimates from the given URL.
 *
 * @param url - The gas estimate URL.
 * @param clientId - The client ID used to identify to the API who is asking for estimates.
 * @returns The gas estimates.
 */
declare function fetchGasEstimates(url: string, clientId?: string): Promise<GasFeeEstimates>;
/**
 * Hit the legacy MetaSwaps gasPrices estimate api and return the low, medium
 * high values from that API.
 *
 * @param url - The URL to fetch gas price estimates from.
 * @param clientId - The client ID used to identify to the API who is asking for estimates.
 * @returns The gas price estimates.
 */
declare function fetchLegacyGasPriceEstimates(url: string, clientId?: string): Promise<LegacyGasPriceEstimate>;
/**
 * Get a gas price estimate from the network using the `eth_gasPrice` method.
 *
 * @param ethQuery - The EthQuery instance to call the network with.
 * @returns A gas price estimate.
 */
declare function fetchEthGasPriceEstimate(ethQuery: any): Promise<EthGasPriceEstimate>;
/**
 * Estimate the time it will take for a transaction to be confirmed.
 *
 * @param maxPriorityFeePerGas - The max priority fee per gas.
 * @param maxFeePerGas - The max fee per gas.
 * @param gasFeeEstimates - The gas fee estimates.
 * @returns The estimated lower and upper bounds for when this transaction will be confirmed.
 */
declare function calculateTimeEstimate(maxPriorityFeePerGas: string, maxFeePerGas: string, gasFeeEstimates: GasFeeEstimates): EstimatedGasFeeTimeBounds;

declare const gasUtil_normalizeGWEIDecimalNumbers: typeof normalizeGWEIDecimalNumbers;
declare const gasUtil_fetchGasEstimates: typeof fetchGasEstimates;
declare const gasUtil_fetchLegacyGasPriceEstimates: typeof fetchLegacyGasPriceEstimates;
declare const gasUtil_fetchEthGasPriceEstimate: typeof fetchEthGasPriceEstimate;
declare const gasUtil_calculateTimeEstimate: typeof calculateTimeEstimate;
declare namespace gasUtil {
  export {
    gasUtil_normalizeGWEIDecimalNumbers as normalizeGWEIDecimalNumbers,
    gasUtil_fetchGasEstimates as fetchGasEstimates,
    gasUtil_fetchLegacyGasPriceEstimates as fetchLegacyGasPriceEstimates,
    gasUtil_fetchEthGasPriceEstimate as fetchEthGasPriceEstimate,
    gasUtil_calculateTimeEstimate as calculateTimeEstimate,
  };
}

/**
 * @type Result
 * @property result - Promise resolving to a new transaction hash
 * @property transactionMeta - Meta information about this new transaction
 */
interface Result {
    result: Promise<string>;
    transactionMeta: TransactionMeta;
}
/**
 * @type Fetch All Options
 * @property fromBlock - String containing a specific block decimal number
 * @property etherscanApiKey - API key to be used to fetch token transactions
 */
interface FetchAllOptions {
    fromBlock?: string;
    etherscanApiKey?: string;
}
/**
 * @type Transaction
 *
 * Transaction representation
 * @property chainId - Network ID as per EIP-155
 * @property data - Data to pass with this transaction
 * @property from - Address to send this transaction from
 * @property gas - Gas to send with this transaction
 * @property gasPrice - Price of gas with this transaction
 * @property gasUsed -  Gas used in the transaction
 * @property nonce - Unique number to prevent replay attacks
 * @property to - Address to send this transaction to
 * @property value - Value associated with this transaction
 */
interface Transaction {
    chainId?: number;
    data?: string;
    from: string;
    gas?: string;
    gasPrice?: string;
    gasUsed?: string;
    nonce?: string;
    to?: string;
    value?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    estimatedBaseFee?: string;
}
interface GasPriceValue {
    gasPrice: string;
}
interface FeeMarketEIP1559Values {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
}
/**
 * The status of the transaction. Each status represents the state of the transaction internally
 * in the wallet. Some of these correspond with the state of the transaction on the network, but
 * some are wallet-specific.
 */
declare enum TransactionStatus {
    approved = "approved",
    cancelled = "cancelled",
    confirmed = "confirmed",
    failed = "failed",
    rejected = "rejected",
    signed = "signed",
    submitted = "submitted",
    unapproved = "unapproved"
}
declare type TransactionMetaBase = {
    isTransfer?: boolean;
    transferInformation?: {
        symbol: string;
        contractAddress: string;
        decimals: number;
    };
    id: string;
    networkID?: string;
    chainId?: string;
    origin?: string;
    rawTransaction?: string;
    time: number;
    toSmartContract?: boolean;
    transaction: Transaction;
    transactionHash?: string;
    blockNumber?: string;
    verifiedOnBlockchain?: boolean;
};
/**
 * @type TransactionMeta
 *
 * TransactionMeta representation
 * @property error - Synthesized error information for failed transactions
 * @property id - Generated UUID associated with this transaction
 * @property networkID - Network code as per EIP-155 for this transaction
 * @property origin - Origin this transaction was sent from
 * @property deviceConfirmedOn - string to indicate what device the transaction was confirmed
 * @property rawTransaction - Hex representation of the underlying transaction
 * @property status - String status of this transaction
 * @property time - Timestamp associated with this transaction
 * @property toSmartContract - Whether transaction recipient is a smart contract
 * @property transaction - Underlying Transaction object
 * @property transactionHash - Hash of a successful transaction
 * @property blockNumber - Number of the block where the transaction has been included
 */
declare type TransactionMeta = ({
    status: Exclude<TransactionStatus, TransactionStatus.failed>;
} & TransactionMetaBase) | ({
    status: TransactionStatus.failed;
    error: Error;
} & TransactionMetaBase);

type transaction_Result = Result;
type transaction_FetchAllOptions = FetchAllOptions;
type transaction_Transaction = Transaction;
type transaction_GasPriceValue = GasPriceValue;
type transaction_FeeMarketEIP1559Values = FeeMarketEIP1559Values;
type transaction_TransactionStatus = TransactionStatus;
declare const transaction_TransactionStatus: typeof TransactionStatus;
type transaction_TransactionMeta = TransactionMeta;
declare namespace transaction {
  export {
    transaction_Result as Result,
    transaction_FetchAllOptions as FetchAllOptions,
    transaction_Transaction as Transaction,
    transaction_GasPriceValue as GasPriceValue,
    transaction_FeeMarketEIP1559Values as FeeMarketEIP1559Values,
    transaction_TransactionStatus as TransactionStatus,
    transaction_TransactionMeta as TransactionMeta,
  };
}

declare const version = "development/0.2.0";

declare const version$1_version: typeof version;
declare namespace version$1 {
  export {
    version$1_version as version,
  };
}

export { calculateBusyThreshold$1 as CalculateBusyThreshold, determineNetworkStatusInfo$1 as DetermineNetworkStatusInfo, fetchBlockFeeHistory$1 as FetchBlockFeeHistory, fetchBusyThreshold$1 as FetchBusyThreshold, gasUtil as GasUtil, transaction as Transaction, version$1 as Version };
