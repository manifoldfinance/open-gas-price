'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var util = require('@metamask/controllers/dist/util');
var ethereumjsUtil = require('ethereumjs-util');

const MAX_NUMBER_OF_BLOCKS_PER_ETH_FEE_HISTORY_CALL = 1024;
async function fetchBlockFeeHistory({
  ethQuery,
  numberOfBlocks: totalNumberOfBlocks,
  endBlock: givenEndBlock = "latest",
  percentiles: givenPercentiles = []
}) {
  const percentiles = givenPercentiles.length > 0 ? Array.from(new Set(givenPercentiles)).sort((a, b) => a - b) : [];
  const finalEndBlockNumber = givenEndBlock === "latest" ? await util.query(ethQuery, "blockNumber") : givenEndBlock;
  const requestChunkSpecifiers = determineRequestChunkSpecifiers(finalEndBlockNumber, totalNumberOfBlocks);
  const blockChunks = await Promise.all(requestChunkSpecifiers.map(({ numberOfBlocks, endBlockNumber }) => {
    return makeRequestForChunk({
      ethQuery,
      numberOfBlocks,
      endBlockNumber,
      percentiles
    });
  }));
  return blockChunks.reduce((array, blocks) => [...array, ...blocks], []);
}
async function makeRequestForChunk({
  ethQuery,
  numberOfBlocks,
  endBlockNumber,
  percentiles
}) {
  const response = await util.query(ethQuery, "eth_feeHistory", [
    util.toHex(numberOfBlocks),
    util.toHex(endBlockNumber),
    percentiles
  ]);
  const startBlockNumber = util.fromHex(response.oldestBlock);
  if (response.baseFeePerGas.length > 0 && response.gasUsedRatio.length > 0 && (response.reward === void 0 || response.reward.length > 0)) {
    const baseFeesPerGasAsHex = response.baseFeePerGas.slice(0, numberOfBlocks);
    const gasUsedRatios = response.gasUsedRatio;
    const priorityFeePercentileGroups = response.reward ?? [];
    return baseFeesPerGasAsHex.map((baseFeePerGasAsHex, blockIndex) => {
      const baseFeePerGas = util.fromHex(baseFeePerGasAsHex);
      const gasUsedRatio = gasUsedRatios[blockIndex];
      const number = startBlockNumber.addn(blockIndex);
      const priorityFeesForEachPercentile = priorityFeePercentileGroups[blockIndex];
      const priorityFeesByPercentile = percentiles.reduce((obj, percentile, percentileIndex) => {
        const priorityFee = priorityFeesForEachPercentile[percentileIndex];
        return { ...obj, [percentile]: util.fromHex(priorityFee) };
      }, {});
      return {
        number,
        baseFeePerGas,
        gasUsedRatio,
        priorityFeesByPercentile
      };
    });
  }
  return [];
}
function determineRequestChunkSpecifiers(endBlockNumber, totalNumberOfBlocks) {
  const specifiers = [];
  for (let chunkStartBlockNumber = endBlockNumber.subn(totalNumberOfBlocks); chunkStartBlockNumber.lt(endBlockNumber); chunkStartBlockNumber = chunkStartBlockNumber.addn(MAX_NUMBER_OF_BLOCKS_PER_ETH_FEE_HISTORY_CALL)) {
    const distanceToEnd = endBlockNumber.sub(chunkStartBlockNumber).toNumber();
    const numberOfBlocks = distanceToEnd < MAX_NUMBER_OF_BLOCKS_PER_ETH_FEE_HISTORY_CALL ? distanceToEnd : MAX_NUMBER_OF_BLOCKS_PER_ETH_FEE_HISTORY_CALL;
    const chunkEndBlockNumber = chunkStartBlockNumber.addn(numberOfBlocks);
    specifiers.push({ numberOfBlocks, endBlockNumber: chunkEndBlockNumber });
  }
  return specifiers;
}

var fetchBlockFeeHistory$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': fetchBlockFeeHistory
});

const NUMBER_OF_BLOCKS_TO_FETCH = 2e4;
async function calculateBusyThreshold(ethQuery) {
  const blocks = await fetchBlockFeeHistory({
    ethQuery,
    numberOfBlocks: NUMBER_OF_BLOCKS_TO_FETCH
  });
  const sortedBaseFeesPerGas = blocks.map((block) => block.baseFeePerGas).sort((a, b) => a.cmp(b));
  const indexAtPercentile90 = Math.floor(sortedBaseFeesPerGas.length * 0.9) - 1;
  return sortedBaseFeesPerGas[indexAtPercentile90];
}

var calculateBusyThreshold$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  calculateBusyThreshold: calculateBusyThreshold,
  'default': calculateBusyThreshold
});

const makeClientIdHeader$1 = (clientId) => ({ "X-Client-Id": clientId });
async function fetchBusyThreshold(url, clientId) {
  const options = clientId !== void 0 ? { headers: makeClientIdHeader$1(clientId) } : {};
  const { busyThreshold: busyBaseFeePerGasThresholdInGwei } = await util.handleFetch(url, options);
  return util.gweiDecToWEIBN(busyBaseFeePerGasThresholdInGwei);
}

var fetchBusyThreshold$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': fetchBusyThreshold
});

async function determineNetworkStatusInfo({
  latestBaseFee,
  url,
  ethQuery,
  clientId
}) {
  let busyBaseFeeThreshold;
  try {
    busyBaseFeeThreshold = await fetchBusyThreshold(url, clientId);
  } catch (error) {
    console.error(`Fetching busy threshold failed due to (${error.message}), trying fallback`);
    busyBaseFeeThreshold = await calculateBusyThreshold(ethQuery);
  }
  const isNetworkBusy = latestBaseFee.gte(busyBaseFeeThreshold);
  return { isNetworkBusy };
}

var determineNetworkStatusInfo$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': determineNetworkStatusInfo
});

const makeClientIdHeader = (clientId) => ({ "X-Client-Id": clientId });
function normalizeGWEIDecimalNumbers(n) {
  const numberAsWEIHex = util.gweiDecToWEIBN(n).toString(16);
  const numberAsGWEI = util.weiHexToGweiDec(numberAsWEIHex).toString(10);
  return numberAsGWEI;
}
async function fetchGasEstimates(url, clientId) {
  const estimates = await util.handleFetch(url, clientId ? { headers: makeClientIdHeader(clientId) } : void 0);
  return {
    low: {
      ...estimates.low,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(estimates.low.suggestedMaxPriorityFeePerGas),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(estimates.low.suggestedMaxFeePerGas)
    },
    medium: {
      ...estimates.medium,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(estimates.medium.suggestedMaxPriorityFeePerGas),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(estimates.medium.suggestedMaxFeePerGas)
    },
    high: {
      ...estimates.high,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(estimates.high.suggestedMaxPriorityFeePerGas),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(estimates.high.suggestedMaxFeePerGas)
    },
    estimatedBaseFee: normalizeGWEIDecimalNumbers(estimates.estimatedBaseFee),
    historicalBaseFeeRange: estimates.historicalBaseFeeRange,
    baseFeeTrend: estimates.baseFeeTrend,
    latestPriorityFeeRange: estimates.latestPriorityFeeRange,
    historicalPriorityFeeRange: estimates.historicalPriorityFeeRange,
    priorityFeeTrend: estimates.priorityFeeTrend,
    networkCongestion: estimates.networkCongestion
  };
}
async function fetchLegacyGasPriceEstimates(url, clientId) {
  const result = await util.handleFetch(url, {
    referrer: url,
    referrerPolicy: "no-referrer-when-downgrade",
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      ...clientId && makeClientIdHeader(clientId)
    }
  });
  return {
    low: result.SafeGasPrice,
    medium: result.ProposeGasPrice,
    high: result.FastGasPrice
  };
}
async function fetchEthGasPriceEstimate(ethQuery) {
  const gasPrice = await util.query(ethQuery, "gasPrice");
  return {
    gasPrice: util.weiHexToGweiDec(gasPrice).toString()
  };
}
function calculateTimeEstimate(maxPriorityFeePerGas, maxFeePerGas, gasFeeEstimates) {
  const { low, medium, high, estimatedBaseFee } = gasFeeEstimates;
  const maxPriorityFeePerGasInWEI = util.gweiDecToWEIBN(maxPriorityFeePerGas);
  const maxFeePerGasInWEI = util.gweiDecToWEIBN(maxFeePerGas);
  const estimatedBaseFeeInWEI = util.gweiDecToWEIBN(estimatedBaseFee);
  const effectiveMaxPriorityFee = ethereumjsUtil.BN.min(maxPriorityFeePerGasInWEI, maxFeePerGasInWEI.sub(estimatedBaseFeeInWEI));
  const lowMaxPriorityFeeInWEI = util.gweiDecToWEIBN(low.suggestedMaxPriorityFeePerGas);
  const mediumMaxPriorityFeeInWEI = util.gweiDecToWEIBN(medium.suggestedMaxPriorityFeePerGas);
  const highMaxPriorityFeeInWEI = util.gweiDecToWEIBN(high.suggestedMaxPriorityFeePerGas);
  let lowerTimeBound;
  let upperTimeBound;
  if (effectiveMaxPriorityFee.lt(lowMaxPriorityFeeInWEI)) {
    lowerTimeBound = null;
    upperTimeBound = "unknown";
  } else if (effectiveMaxPriorityFee.gte(lowMaxPriorityFeeInWEI) && effectiveMaxPriorityFee.lt(mediumMaxPriorityFeeInWEI)) {
    lowerTimeBound = low.minWaitTimeEstimate;
    upperTimeBound = low.maxWaitTimeEstimate;
  } else if (effectiveMaxPriorityFee.gte(mediumMaxPriorityFeeInWEI) && effectiveMaxPriorityFee.lt(highMaxPriorityFeeInWEI)) {
    lowerTimeBound = medium.minWaitTimeEstimate;
    upperTimeBound = medium.maxWaitTimeEstimate;
  } else if (effectiveMaxPriorityFee.eq(highMaxPriorityFeeInWEI)) {
    lowerTimeBound = high.minWaitTimeEstimate;
    upperTimeBound = high.maxWaitTimeEstimate;
  } else {
    lowerTimeBound = 0;
    upperTimeBound = high.maxWaitTimeEstimate;
  }
  return {
    lowerTimeBound,
    upperTimeBound
  };
}

var gasUtil = /*#__PURE__*/Object.freeze({
  __proto__: null,
  normalizeGWEIDecimalNumbers: normalizeGWEIDecimalNumbers,
  fetchGasEstimates: fetchGasEstimates,
  fetchLegacyGasPriceEstimates: fetchLegacyGasPriceEstimates,
  fetchEthGasPriceEstimate: fetchEthGasPriceEstimate,
  calculateTimeEstimate: calculateTimeEstimate
});

var TransactionStatus = /* @__PURE__ */ ((TransactionStatus2) => {
  TransactionStatus2["approved"] = "approved";
  TransactionStatus2["cancelled"] = "cancelled";
  TransactionStatus2["confirmed"] = "confirmed";
  TransactionStatus2["failed"] = "failed";
  TransactionStatus2["rejected"] = "rejected";
  TransactionStatus2["signed"] = "signed";
  TransactionStatus2["submitted"] = "submitted";
  TransactionStatus2["unapproved"] = "unapproved";
  return TransactionStatus2;
})(TransactionStatus || {});

var transaction = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TransactionStatus: TransactionStatus
});

const version = "development/0.2.0";

var version$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  version: version
});

exports.CalculateBusyThreshold = calculateBusyThreshold$1;
exports.DetermineNetworkStatusInfo = determineNetworkStatusInfo$1;
exports.FetchBlockFeeHistory = fetchBlockFeeHistory$1;
exports.FetchBusyThreshold = fetchBusyThreshold$1;
exports.GasUtil = gasUtil;
exports.Transaction = transaction;
exports.Version = version$1;
//# sourceMappingURL=index.js.map
