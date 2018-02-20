const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

const assertThrows = require('../utils/assertThrows')
const { getLog } = require('../utils/txHelpers')

contract('CTKNCrowdsale', ([owner, wallet, refundWallet]) => {
  let crowdsale
  let token
  let tx

  const SECONDS_IN_A_DAY = 60 * 60 * 24
  const ethUsdRate = 927.17
  const ethToTokenRatio = 0.05 // 1 eth gets you 20 tokens.
  const ethToWeiRatio = 10 ^ 18 // one eth is 10^18 wei.
  const rate = ethToTokenRatio * ethToWeiRatio
  const cap = Math.floor(3000000 / (ethUsdRate * ethToTokenRatio)) // in Tokens.
  const startTime = Math.floor(new Date().getTime() / 1000)
  const endTime = startTime + SECONDS_IN_A_DAY

  before(async () => {
    token = await MockCTKN.new()
    // crowdsale = await CTKNCrowdsale.new(
    //   cap,
    //   startTime,
    //   endTime,
    //   rate,
    //   wallet,
    //   refundWallet,
    //   token
    // )
  })

  xit('has owner', async () => {
    assert.equal(await crowdsale.owner(), owner, `expected ${owner}`)
  })
})
