const CTKNCrowdsale = artifacts.require('./CTKNCrowdsale.sol')
const MockCTKN = artifacts.require('./mocks/MockCTKN.sol')

// const assertThrows = require('../utils/assertThrows')
// const { getLog } = require('../utils/txHelpers')
const ether = require('../utils/ether')

const BigNumber = web3.BigNumber

contract('CTKNCrowdsale', ([owner, wallet, refundWallet]) => {
  let crowdsale
  let token
  // let tx

  const SECONDS_IN_A_DAY = 60 * 60 * 24
  // const tokenSupply = new BigNumber('1e22')
  const openingTime = Math.floor(new Date().getTime() / 1000)
  const closingTime = openingTime + SECONDS_IN_A_DAY
  const rate = new BigNumber(1)
  const cap = ether(100)
  const goal = ether(50)

  before(async () => {
    token = await MockCTKN.new()
    crowdsale = await CTKNCrowdsale.new(
      openingTime,
      closingTime,
      rate,
      wallet,
      cap,
      token.address,
      goal
    )
  })

  it('token has owner', async () => {
    assert.equal(await token.owner(), owner, `expected ${owner}`)
  })

  it('crowdsale has owner', async () => {
    assert.equal(await crowdsale.owner(), owner, `expected ${owner}`)
  })
})
