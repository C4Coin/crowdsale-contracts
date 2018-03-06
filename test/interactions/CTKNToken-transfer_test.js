const CTKNToken = artifacts.require('CTKNToken.sol')

const assertThrows = require('../utils/assertThrows')
const { getLog } = require('../utils/txHelpers')

contract(
  'CTKNToken (tranfers)',
  ([owner, punter, anotherPunter, unverifiedPunter, someThirdParty]) => {
    let token
    let tx

    before(async () => {
      token = await CTKNToken.new()
      await token.addVerified(punter, 'some hash')
      await token.addVerified(anotherPunter, 'some other hash')
      await token.mint(punter, 10)
    })

    context('transfer', () => {
      context('from a verified punter to an unverified punter', () => {
        it('is not allowed', () =>
          assertThrows(token.transfer(unverifiedPunter, 1, { from: punter })))
      })

      context('from a verified punter to another verified punter', () => {
        let holderCount

        before(async () => {
          tx = await token.transfer(anotherPunter, 5, { from: punter })
          holderCount = await token.holderCount()
        })

        it('emits the Transfer event', () => {
          assert.ok(getLog(tx, 'Transfer'))
        })

        it('holderCount() is now 2', () => {
          assert.equal(holderCount.toNumber(), 2)
        })
      })
    })

    context('transferFrom', () => {
      before(async () => {
        await token.approve(someThirdParty, 5, { from: punter })
      })

      context('from a verified punter to an unverified punter', () => {
        it('is not allowed', () =>
          assertThrows(
            token.transferFrom(punter, unverifiedPunter, 1, {
              from: someThirdParty
            })
          ))
      })

      context('from a verified punter to another verified punter', () => {
        let holderCount

        before(async () => {
          tx = await token.transferFrom(punter, anotherPunter, 5, {
            from: someThirdParty
          })
          holderCount = await token.holderCount()
        })

        it('emits the Transfer event', () => {
          assert.ok(getLog(tx, 'Transfer'))
        })

        it('punter now has no tokens so holderCount() is now 1', () => {
          assert.equal(holderCount.toNumber(), 1)
        })
      })
    })
  }
)
