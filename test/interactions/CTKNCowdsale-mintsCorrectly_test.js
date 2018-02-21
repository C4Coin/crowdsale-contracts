const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

// const assertThrows = require('../utils/assertThrows')
// const { getLog } = require('../utils/txHelpers')
const { makeCrowdsale } = require('../utils/fake')
const { toWei } = require('../utils/ether')

const BigNumber = web3.BigNumber

contract('CTKNCrowdsale minting', accounts => {
  const [wallet, punter] = accounts.slice(1)

  let crowdsale
  let token

  // TODO: now set the rate such that 1ETH buys 2 Tokens
  const rate = new BigNumber(1)

  before(async () => {
    token = await MockCTKN.new()
    crowdsale = await makeCrowdsale(CTKNCrowdsale, { wallet, token, rate })
    await token.transferOwnership(crowdsale.address)
    // const punterBalance = await web3.eth.getBalance(punter)
    // console.log('punter balance', fromWei(punterBalance).toNumber())
  })

  context('low level payment', () => {
    const amount = toWei(1)

    // TODO: change expected to 2
    const expected = rate.mul(amount)
    let balance

    before(async () => {
      await crowdsale.send(amount, { from: punter })
      await crowdsale.buyTokens(punter, { value: amount, from: punter })
      balance = await token.balanceOf(punter)
    })

    it('sold the punter the correct number of tokens', async () => {
      assert.equal(balance.toNumber(), expected.toNumber())
    })
  })
})
