const CTKNCrowdsale = artifacts.require(
  './mocks/MockCTKNCrowdsaleWithMutableDates.sol'
)
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const { SECONDS_IN_A_DAY, makeCrowdsale } = require('../utils/fake')
const { toWei } = require('../utils/ether')
const assertThrows = require('../utils/assertThrows')

const BigNumber = web3.BigNumber

contract('CTKNCrowdsale investor can claim refunds', accounts => {
  const [wallet, overpaymentWallet, punter] = accounts.slice(1)

  let crowdsale
  let token

  // the rate needs to be the number of wei needed to buy 1 token.
  // so set the rate such that 1ETH buys 2 Tokens
  const rate = toWei(0.5)

  // pay 1.2 ETH
  const amount = toWei(1.2)

  // Set the goal low, to 2 eth
  // which at $850 per ETH is $1700
  // ie 170000 cents.
  const goal = new BigNumber(170000)

  before(async () => {
    token = await MockCTKN.new()
    crowdsale = await makeCrowdsale(CTKNCrowdsale, {
      wallet,
      overpaymentWallet,
      token,
      rate,
      goal
    })
    await token.transferOwnership(crowdsale.address)
    // await crowdsale.send(amount, { from: punter })
    await crowdsale.buyTokens(punter, { value: amount, from: punter })
  })

  context('not closed', () => {
    it('calling claimRefund throws', () =>
      assertThrows(crowdsale.claimRefund({ from: punter })))

    context('now turn back time', () => {
      before(async () => {
        await crowdsale.turnBackTime(SECONDS_IN_A_DAY * 2)
      })

      it('hasClosed', async () => {
        assert.isTrue(await crowdsale.hasClosed())
      })

      context('not yet finalised', () => {
        it('calling claimRefund throws', () =>
          assertThrows(crowdsale.claimRefund({ from: punter })))
      })

      context('it is finalised', () => {
        let refunded
        let balance

        before(async () => {
          await crowdsale.finalize()
        })

        context('but goal not reached', () => {
          const expectedMin = toWei(1.1) // gas costs can vary

          before(async () => {
            balance = web3.eth.getBalance(punter)
            await crowdsale.claimRefund({ from: punter })
            const newBalance = web3.eth.getBalance(punter)
            refunded = newBalance.minus(balance)
          })

          it('calling claimRefund refunds the total amount less gas costs', () => {
            assert.isTrue(refunded.lt(amount) && refunded.gt(expectedMin))
          })
        })
      })
    })
  })
})
