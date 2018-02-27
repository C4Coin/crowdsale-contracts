const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const assertThrows = require('../utils/assertThrows')
const { fakeOpeningTime, makeCrowdsale } = require('../utils/fake')

contract('CTKNCrowdsale creation', ([owner, wallet, overpaymentWallet]) => {
  let crowdsale
  let token
  // let tx

  before(async () => {
    token = await MockCTKN.new()
  })

  context('ownership', () => {
    it('token has the correct owner', async () => {
      assert.equal(await token.owner(), owner, `expected ${owner}`)
    })
  })

  context('Crowdsale given bad data', () => {
    it('throws if given openingTime of 0', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          openingTime: 0
        })
      ))

    it('throws if given openingTime in the past', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          openingTime: 1000
        })
      ))

    it('throws if closingTime before openingTime', () => {
      const openingTime = fakeOpeningTime()

      return assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          token,
          closingTime: openingTime - 1
        })
      )
    })

    it('throws if given rate of 0', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          rate: 0
        })
      ))

    it('throws if given usdConversionRate of 0', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          usdConversionRate: 0
        })
      ))

    it('throws if given cap of 0', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          cap: 0
        })
      ))

    it('throws if given goal of 0', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          goal: 0
        })
      ))

    it("throws if given goal that's greater than the cap", () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, {
          wallet,
          overpaymentWallet,
          token,
          cap: 5,
          goal: 10
        })
      ))

    it('throws if given zero wallet address', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, { wallet: 0x0, overpaymentWallet, token })
      ))

    it('throws if given zero overpaymentWallet address', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, { wallet, overpaymentWallet: 0x0, token })
      ))

    it('throws if given zero token address', () =>
      assertThrows(
        makeCrowdsale(CTKNCrowdsale, { wallet, overpaymentWallet, token: 0x0 })
      ))
  })

  context('Crowdsale given good data', () => {
    before(async () => {
      crowdsale = await makeCrowdsale(CTKNCrowdsale, {
        wallet,
        overpaymentWallet,
        token
      })
    })

    context('ownership', () => {
      it('crowdsale has the correct owner', async () => {
        assert.equal(await crowdsale.owner(), owner, `expected ${owner}`)
      })
    })
  })
})
