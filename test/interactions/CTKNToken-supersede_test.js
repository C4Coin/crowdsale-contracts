const CTKNToken = artifacts.require('CTKNToken.sol')

const assertThrows = require('../utils/assertThrows')
const { getLog } = require('../utils/txHelpers')

contract(
  'CTKNToken (cancelAndReissue)',
  ([
    owner,
    punterWithTokens,
    punterWithoutTokens,
    anotherPunterWithoutTokens,
    anotherPunterWithTokens,
    unverifiedPunter
  ]) => {
    let token
    let tx

    before(async () => {
      token = await CTKNToken.new()
      await token.addVerified(punterWithTokens, 'some hash')
      await token.addVerified(punterWithoutTokens, 'some other hash')
      await token.addVerified(anotherPunterWithTokens, 'some third hash')
      await token.addVerified(anotherPunterWithoutTokens, 'some fourth hash')
      await token.mint(punterWithTokens, 10)
      await token.mint(anotherPunterWithTokens, 5)
    })

    context('before doing anything', () => {
      context('getCurrentFor', () => {
        it('getCurrentFor(punterWithTokens) is punterWithTokens', async () => {
          assert.equal(
            await token.getCurrentFor(punterWithTokens),
            punterWithTokens
          )
        })

        it('getCurrentFor(0x0) is 0x0', async () => {
          assert.equal(await token.getCurrentFor(0x0), 0x0)
        })
      })

      context('it throws trying to cancelAndReissue', () => {
        it('punterWithTokens for anotherPunterWithTokens', () =>
          assertThrows(
            token.cancelAndReissue(punterWithTokens, anotherPunterWithTokens)
          ))

        it('punterWithTokens for anotherPunterWithTokens', () =>
          assertThrows(
            token.cancelAndReissue(punterWithTokens, unverifiedPunter)
          ))

        it('punterWithoutTokens for anotherPunterWithoutTokens', () =>
          assertThrows(
            token.cancelAndReissue(
              punterWithoutTokens,
              anotherPunterWithoutTokens
            )
          ))
      })
    })

    context(
      'cancel punterWithTokens and re-issued to punterWithoutTokens',
      () => {
        let balance

        before(async () => {
          balance = await token.balanceOf(punterWithTokens)
          tx = await token.cancelAndReissue(
            punterWithTokens,
            punterWithoutTokens
          )
        })

        it('emitted VerifiedAddressSuperseded event', () => {
          assert.ok(getLog(tx, 'VerifiedAddressSuperseded'))
        })

        it('getCurrentFor(punterWithTokens) is punterWithoutTokens', async () => {
          assert.equal(
            await token.getCurrentFor(punterWithTokens),
            punterWithoutTokens
          )
        })

        it('isSuperseded(punterWithTokens) is true', async () => {
          assert.isTrue(await token.isSuperseded(punterWithTokens))
        })

        it('isVerified(punterWithTokens) is false', async () => {
          assert.isFalse(await token.isVerified(punterWithTokens))
        })

        it("can't verify punterWithTokens", () =>
          assertThrows(token.addVerified(punterWithTokens, 'some new hash')))

        it("can't unverify punterWithoutTokens", () =>
          assertThrows(token.removeVerified(punterWithoutTokens)))

        it('balanceOf(punterWithTokens) is 0', async () => {
          const b = await token.balanceOf(punterWithTokens)
          assert.equal(b.toNumber(), 0)
        })

        it("punterWithoutTokens's balance is what punterWithTokens had", async () => {
          const b = await token.balanceOf(punterWithoutTokens)
          assert.equal(b.toNumber(), balance.toNumber())
        })
      }
    )
  }
)
