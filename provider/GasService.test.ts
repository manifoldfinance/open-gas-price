import { GasService } from 'src/gasboost/GasService'

describe('GasService', () => {
  it('getGasFeeData', async () => {
    const gasService = new GasService()
    const result = await gasService.getGasFeeData()
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.slow.gasPrice).toBeTruthy()
    expect(result.standard.gasPrice).toBeTruthy()
    expect(result.fast.gasPrice).toBeTruthy()
  }, 10 * 60 * 1000)
  it('get1559GasFeeData', async () => {
    const gasService = new GasService()
    const result = await gasService.get1559GasFeeData()
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.slow.maxFeePerGas).toBeTruthy()
    expect(result.slow.maxPriorityFeePerGas).toBeTruthy()
    expect(result.standard.maxFeePerGas).toBeTruthy()
    expect(result.standard.maxPriorityFeePerGas).toBeTruthy()
    expect(result.fast.maxFeePerGas).toBeTruthy()
    expect(result.fast.maxPriorityFeePerGas).toBeTruthy()
  }, 10 * 60 * 1000)
  it('etherchain getGasFeeData', async () => {
    const gas = new GasService()
    const result = await gas.etherchain.getGasFeeData()
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.slow.gasPrice).toBeTruthy()
    expect(result.standard.gasPrice).toBeTruthy()
    expect(result.fast.gasPrice).toBeTruthy()
  }, 10 * 60 * 1000)
  it('etherscan getGasFeeData', async () => {
    const gas = new GasService()
    const result = await gas.etherscan.getGasFeeData()
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.slow.gasPrice).toBeTruthy()
    expect(result.standard.gasPrice).toBeTruthy()
    expect(result.fast.gasPrice).toBeTruthy()
  }, 10 * 60 * 1000)
  it('blocknative getGasFeeData', async () => {
    const gas = new GasService()
    const result = await gas.blocknative.getGasFeeData()
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.slow.maxFeePerGas).toBeTruthy()
    expect(result.slow.maxPriorityFeePerGas).toBeTruthy()
    expect(result.standard.maxFeePerGas).toBeTruthy()
    expect(result.standard.maxPriorityFeePerGas).toBeTruthy()
    expect(result.fast.maxFeePerGas).toBeTruthy()
    expect(result.fast.maxPriorityFeePerGas).toBeTruthy()
  }, 10 * 60 * 1000)
  it('alchemy getGasFeeData', async () => {
    const gas = new GasService()
    const result = await gas.alchemy.getGasFeeData()
    console.log(result)
    expect(result).toBeTruthy()
    expect(result.slow.maxFeePerGas).toBeTruthy()
    expect(result.slow.maxPriorityFeePerGas).toBeTruthy()
    expect(result.standard.maxFeePerGas).toBeTruthy()
    expect(result.standard.maxPriorityFeePerGas).toBeTruthy()
    expect(result.fast.maxFeePerGas).toBeTruthy()
    expect(result.fast.maxPriorityFeePerGas).toBeTruthy()
  }, 10 * 60 * 1000)
})
