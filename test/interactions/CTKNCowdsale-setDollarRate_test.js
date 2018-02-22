const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const assertThrows = require('../utils/assertThrows')
const { getLog } = require('../utils/txHelpers')
const { makeCrowdsale } = require('../utils/fake')
const { toWei } = require('../utils/ether')

// const BigNumber = web3.BigNumber

contract('CTKNCrowdsale setDollarRate', accounts => {
  const [wallet] = accounts.slice(1)
  let crowdsale
  let token
  let tx

  before(async () => {
    token = await MockCTKN.new()
    crowdsale = await makeCrowdsale(CTKNCrowdsale, { wallet, token })
  })

  context('given bad data', () => {
    it('throws if rate is 0', () => assertThrows(crowdsale.setDollarRate(0)))
  })

  context('given good data', () => {
    const dollarRate = toWei(0.75)

    before(async () => {
      tx = await crowdsale.setDollarRate(dollarRate)
    })

    it('fired off the DollarRateSet event', () => {
      assert.ok(getLog(tx, 'DollarRateSet'))
    })

    it('set the dollarRate correctly', async () => {
      const dr = await crowdsale.dollarRate()
      assert.equal(dr.toNumber(), dollarRate.toNumber())
    })
  })
})
