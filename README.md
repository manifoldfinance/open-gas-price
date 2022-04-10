[Open Gas Price](README.md) 

# Open Gas Price API

> WIP


## Overview

> TODO

## Quickstart

> TODO

### Namespaces

- [CalculateBusyThreshold](#)
- [DetermineNetworkStatusInfo](#)
- [FetchBlockFeeHistory](#)
- [FetchBusyThreshold](#)
- [GasUtil](#)


## Functions

### calculateBusyThreshold

▸ **calculateBusyThreshold**(): `Promise`<`BN`\>

Uses historical base fees to determine a threshold we can use to determine whether the network is
busy. Specifically, pulls the last 20,000 blocks (which at the time of this writing represents
around 2 days), sorts the base fees of those blocks, then chooses the base fee which is 9/10 of
the way into the list (i.e. the 90th percentile).

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `ethQuery` | `any` | An GraphQL Query instance. |

#### Returns

`Promise`<`BN`\>

A promise for the 90th percentile base fee in WEI, as a BN.

#### Defined in

[calculateBusyThreshold.ts:17](https://github.com/manifoldfinance/open-gas-price/blob/4897ef1/src/calculateBusyThreshold.ts#L17)


## Namespace: FetchBlockFeeHistory


### Type aliases

- [Block](FetchBlockFeeHistory.md#block)
- [EthFeeHistoryResponse](FetchBlockFeeHistory.md#ethfeehistoryresponse)

### Functions

- [default](FetchBlockFeeHistory.md#default)

## Type aliases

### Block

Ƭ **Block**<`Percentile`\>: `Object`

**`property`** number - The number of the block, as a BN.

**`property`** baseFeePerGas - The base fee per gas for the block in WEI, as a BN.

**`property`** gasUsedRatio - A number between 0 and 1 that represents the ratio between the gas paid
for the block and its set gas limit.

**`property`** priorityFeesByPercentile - The priority fees paid for the transactions in the block
that occurred at particular levels at which those transactions contributed to the overall gas
used for the block, indexed by those percentiles. (See docs for {@link fetchBlockFeeHistory} for more
on how this works.)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Percentile` | extends `number` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `baseFeePerGas` | `BN` |
| `gasUsedRatio` | `number` |
| `number` | `BN` |
| `priorityFeesByPercentile` | `Record`<`Percentile`, `BN`\> |

#### Defined in

[fetchBlockFeeHistory.ts:53](https://github.com/manifoldfinance/open-gas-price/blob/4897ef1/src/fetchBlockFeeHistory.ts#L53)

___

### EthFeeHistoryResponse

Ƭ **EthFeeHistoryResponse**: `Object`

**`property`** oldestBlock - The id of the oldest block (in hex format) in the range of blocks
requested.

**`property`** baseFeePerGas - Base fee per gas for each block in the range of blocks requested.

**`property`** gasUsedRatio - A number between 0 and 1 that represents the gas used vs. gas limit for
each block in the range of blocks requested.

**`property`** reward - The priority fee at the percentiles requested for each block in the range of
blocks requested.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `baseFeePerGas` | `string`[] |
| `gasUsedRatio` | `number`[] |
| `oldestBlock` | `string` |
| `reward?` | `string`[][] |

#### Defined in

[fetchBlockFeeHistory.ts:33](https://github.com/manifoldfinance/open-gas-price/blob/4897ef1/src/fetchBlockFeeHistory.ts#L33)

## Functions

### default

▸ **default**<`Percentile`\>(`args`): `Promise`<[`Block`](FetchBlockFeeHistory.md#block)<`Percentile`\>[]\>

Uses `eth_feeHistory` (an EIP-1559 feature) to obtain information about gas fees from a range of
blocks that have occurred recently on a network.

To learn more, see these resources:

- <https://infura.io/docs/ethereum#operation/eth_feeHistory>
- <https://github.com/zsfelfoldi/feehistory/blob/main/docs/feeHistory.md>
- <https://github.com/ethereum/go-ethereum/blob/57a3fab8a75eeb9c2f4fab770b73b51b9fe672c5/eth/gasprice/feehistory.go#L180>
- <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md>
- <https://gas-api.metaswap.codefi.network/testFeeHistory>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `Percentile` | extends `number` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | The arguments to this function. |
| `args.endBlock?` | `BN` \| ``"latest"`` | The desired end of the requested block range. Can be "latest" if you want to start from the latest successful block or the number of a known past block. |
| `args.ethQuery` | `any` | An EthQuery instance that wraps a provider for the network in question. |
| `args.numberOfBlocks` | `number` | How many total blocks to fetch. Note that if this is more than 1024, multiple calls to `eth_feeHistory` will be made. |
| `args.percentiles?` | readonly `Percentile`[] | A set of numbers between 1 and 100 which will dictate how `priorityFeesByPercentile` in each returned block will be formed. When Ethereum runs the `eth_feeHistory` method, for each block it is considering, it will first sort all transactions by the priority fee. It will then go through each transaction and add the total amount of gas paid for that transaction to a bucket which maxes out at the total gas used for the whole block. As the bucket fills, it will cross percentages which correspond to the percentiles specified here, and the priority fees of the first transactions which cause it to reach those percentages will be recorded. Hence, `priorityFeesByPercentile` represents the priority fees of transactions at key gas used contribution levels, where earlier levels have smaller contributions and later levels have higher contributions. |

#### Returns

`Promise`<[`Block`](FetchBlockFeeHistory.md#block)<`Percentile`\>[]\>

The list of blocks and their fee data, sorted from oldest to newest.

#### Defined in

[fetchBlockFeeHistory.ts:92](https://github.com/manifoldfinance/open-gas-price/blob/4897ef1/src/fetchBlockFeeHistory.ts#L92)



## Namespace: DetermineNetworkStatusInfo

### Type aliases

- [NetworkStatusInfo](DetermineNetworkStatusInfo.md#networkstatusinfo)

### Functions

- [default](DetermineNetworkStatusInfo.md#default)

## Type aliases

### NetworkStatusInfo

Ƭ **NetworkStatusInfo**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `isNetworkBusy` | `boolean` |

#### Defined in

[determineNetworkStatusInfo.ts:7](https://github.com/manifoldfinance/open-gas-price/blob/4897ef1/src/determineNetworkStatusInfo.ts#L7)

## Functions

### default

▸ **default**(`args`): `Promise`<[`NetworkStatusInfo`](DetermineNetworkStatusInfo.md#networkstatusinfo)\>

Collects information about the status of the network. Right now the only piece of information is
whether the network is "busy" — i.e., whether the base fee for the latest block exceeds a
particular "busy" threshold.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `args` | `Object` | The arguments. |
| `args.clientId` | `undefined` \| `string` | The ID of the client making this request. |
| `args.ethQuery` | `any` | An EthQuery instance. |
| `args.latestBaseFee` | `BN` | The base fee for the latest block in WEI. |
| `args.url` | `string` | The URL for the API used to determine a base fee threshold. |

#### Returns

`Promise`<[`NetworkStatusInfo`](DetermineNetworkStatusInfo.md#networkstatusinfo)\>

The network status info.

#### Defined in

[determineNetworkStatusInfo.ts:23](https://github.com/manifoldfinance/open-gas-price/blob/4897ef1/src/determineNetworkStatusInfo.ts#L23)
