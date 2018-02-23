const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const { makeCrowdsale } = require('../utils/fake')
const { toWei } = require('../utils/ether')

contract('CTKNCrowdsale minting given overpayment', accounts => {
  const [wallet, refundWallet, punter] = accounts.slice(1)

  let crowdsale
  let token

  // the rate needs to be the number of wei needed to buy 1 token.
  // so set the rate such that 1ETH buys 2 Tokens
  const rate = toWei(0.5)

  before(async () => {
    token = await MockCTKN.new()
    crowdsale = await makeCrowdsale(CTKNCrowdsale, {
      wallet,
      refundWallet,
      token,
      rate
    })
    await token.transferOwnership(crowdsale.address)
  })

  context('overpayment', () => {
    // pay 1.2 ETH
    const amount = toWei(1.2)
    // still expect 2 tokens.
    const expected = 2
    const expectedRefund = toWei(0.2).toNumber()

    let balance
    let refundBalance

    before(async () => {
      await crowdsale.send(amount, { from: punter })
      await crowdsale.buyTokens(punter, { value: amount, from: punter })
      balance = await token.balanceOf(punter)
      refundBalance = await crowdsale.refundBalance(punter)
    })

    it('sold the punter the correct number of tokens', async () => {
      assert.equal(balance.toNumber(), expected)
    })

    // also expect the remaining 0.2 ETH to be set aside for refund.
    it('has no refundable amount for the punter', async () => {
      assert.equal(refundBalance.toNumber(), expectedRefund)
    })
  })
})
