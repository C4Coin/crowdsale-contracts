const ether = require('../utils/ether')

const SECONDS_IN_A_DAY = 60 * 60 * 24
const BigNumber = web3.BigNumber

const crowdsaleData = ({ wallet, token, ...fields }) => {
  // const tokenSupply = new BigNumber('1e22')
  const openingTime =
    fields.openingTime || Math.floor(new Date().getTime() / 1000)
  const closingTime = openingTime + SECONDS_IN_A_DAY
  // Usually this represents how many tokens 1 wei buys?
  // instead we need the rate to represent how many wei one token costs.
  const rate = new BigNumber(1)

  // usually this cap is represented in wei but we need it to be in USD.
  const cap = ether(100)

  // usually the goal is represented in wei but we need it to be in USD.
  const goal = ether(50)

  const data = {
    openingTime,
    closingTime,
    rate,
    wallet,
    cap,
    token,
    goal,
    ...fields
  }

  return [
    data.openingTime,
    data.closingTime,
    data.rate,
    data.wallet,
    data.cap,
    data.token,
    data.goal
  ]
}

const makeCrowdsale = async (
  Crowdsale,
  { wallet, token: tokenOrTokenAddress, ...fields }
) => {
  const token =
    tokenOrTokenAddress.address !== undefined
      ? tokenOrTokenAddress.address
      : tokenOrTokenAddress
  const crowdsale = await Crowdsale.new(
    ...crowdsaleData({ wallet, token, ...fields })
  )
  return crowdsale
}

module.exports = {
  crowdsaleData,
  makeCrowdsale
}
