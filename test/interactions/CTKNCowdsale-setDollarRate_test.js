const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const assertThrows = require('../utils/assertThrows')
const { getLog } = require('../utils/txHelpers')
const { makeCrowdsale } = require('../utils/fake')
const { toWei } = require('../utils/ether')

contract('CTKNCrowdsale setUSDConversionRate', accounts => {
  const [wallet, overpaymentWallet] = accounts.slice(1)
  let crowdsale
  let token
  let tx

  before(async () => {
    token = await MockCTKN.new()
    crowdsale = await makeCrowdsale(CTKNCrowdsale, {
      wallet,
      overpaymentWallet,
      token
    })
  })

  context('given bad data', () => {
    it('throws if rate is 0', () =>
      assertThrows(crowdsale.setUSDConversionRate(0)))
  })

  context('given good data', () => {
    // let's change it so 1 ETH is US$1000 (nice default)
    // ie 1 dollar buys 0.001 ETH
    // 1 cent buys 0.00001 ETH
    const usdConversionRate = toWei(0.00001)

    before(async () => {
      tx = await crowdsale.setUSDConversionRate(usdConversionRate)
    })

    it('fired off the USDConversionRateSet event', () => {
      assert.ok(getLog(tx, 'USDConversionRateSet'))
    })

    it('set the usdConversionRate correctly', async () => {
      const dr = await crowdsale.usdConversionRate()
      assert.equal(dr.toNumber(), usdConversionRate.toNumber())
    })
  })
})
