const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const { makeCrowdsale } = require('../utils/fake')
const { SECONDS_IN_A_DAY, toWei } = require('../utils/ether')
const assertThrows = require('../utils/assertThrows')
const timeTravel = require('../utils/timeTravel')

/*
  TODO: The timeTravel does not appear to be working.
*/
contract('CTKNCrowdsale investor can claim refunds', accounts => {
  const [wallet, refundWallet, punter, anotherPunter] = accounts.slice(1)

  let crowdsale
  let token

  // the rate needs to be the number of wei needed to buy 1 token.
  // so set the rate such that 1ETH buys 2 Tokens
  const rate = toWei(0.5)

  // pay 1.2 ETH
  const amount = toWei(1.2)

  // TODO: The goal needs to be set in USD
  const goal = toWei(2)

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
    await crowdsale.send(amount, { from: punter })
    await crowdsale.buyTokens(punter, { value: amount, from: punter })
  })

  context('not closed', () => {
    it('calling claimRefund throws', () =>
      assertThrows(crowdsale.claimRefund({ from: punter })))

    // TODO: for some reason it's not reporting as closed.
    xcontext('now wait for it to close', () => {
      before(async () => {
        await timeTravel(SECONDS_IN_A_DAY * 2)
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
          const expected = toWei(0.2)

          before(async () => {
            balance = web3.eth.getBalance(punter)
            await crowdsale.claimRefund({ from: punter })
            const newBalance = web3.eth.getBalance(punter)
            refunded = newBalance.minus(balance)
          })

          it('calling claimRefund only refunds the overpayment', () => {
            assert.equal(refunded.toNumber(), expected.toNumber())
          })
        })

        context('and goal reached', () => {
          const expected = toWei(1.2)

          before(async () => {
            await crowdsale.send(amount, { from: anotherPunter })
            await crowdsale.buyTokens(punter, {
              value: amount,
              from: anotherPunter
            })
            balance = web3.eth.getBalance(anotherPunter)
            await crowdsale.claimRefund({ from: anotherPunter })
            const newBalance = web3.eth.getBalance(anotherPunter)
            refunded = newBalance.minus(balance)
          })

          it('calling claimRefund only refunds the overpayment', () => {
            assert.equal(refunded.toNumber(), expected.toNumber())
          })
        })
      })
    })
  })
})
