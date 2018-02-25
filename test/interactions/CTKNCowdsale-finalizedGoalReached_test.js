const CTKNCrowdsale = artifacts.require(
  './mocks/MockCTKNCrowdsaleWithMutableDates.sol'
)
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const { SECONDS_IN_A_DAY, makeCrowdsale } = require('../utils/fake')
const { toWei } = require('../utils/ether')
const assertThrows = require('../utils/assertThrows')
// const timeTravel = require('../utils/timeTravel')
const { getLog } = require('../utils/txHelpers')

contract(
  'CTKNCrowdsale investor can claim refunds (goal reached)',
  accounts => {
    const [wallet, refundWallet, punter, anotherPunter] = accounts.slice(1)

    let crowdsale
    let token
    let refunded

    // the rate needs to be the number of wei needed to buy 1 token.
    // so set the rate such that 1ETH buys 2 Tokens
    const rate = toWei(0.5)

    // pay 1.2 ETH
    const amount = toWei(1.2)
    // goal reached so only refund overpayment less gas costs.
    const expectedMax = amount.minus(rate.times(2))

    // TODO: The goal needs to be set in USD
    const goal = toWei(1)

    before(async () => {
      token = await MockCTKN.new()
      crowdsale = await makeCrowdsale(CTKNCrowdsale, {
        wallet,
        refundWallet,
        token,
        rate,
        goal
      })
      await token.transferOwnership(crowdsale.address)
      // await crowdsale.send(amount, { from: punter })
      await crowdsale.buyTokens(punter, { value: amount, from: punter })
      await crowdsale.turnBackTime(SECONDS_IN_A_DAY * 2)
      await crowdsale.finalize()
      const balance = web3.eth.getBalance(punter)
      await crowdsale.claimRefund({ from: punter })
      const newBalance = web3.eth.getBalance(punter)
      refunded = newBalance.minus(balance)
    })

    it('calling claimRefund only refunds the overpayment, less some gas', () => {
      assert.isTrue(refunded.lt(expectedMax)) // the gas amount can vary slightly.
    })
  }
)
