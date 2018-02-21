const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

// const assertThrows = require('../utils/assertThrows')
// const { getLog } = require('../utils/txHelpers')
const { makeCrowdsale } = require('../utils/fake')

// const BigNumber = web3.BigNumber

contract(
  'CTKNCrowdsale: (integration tests)',
  ([owner, wallet, refundWallet]) => {
    let crowdsale
    let token
    // let tx

    before(async () => {
      token = await MockCTKN.new()
      crowdsale = await makeCrowdsale(CTKNCrowdsale, { wallet, token })
    })
  }
)
