const { toWei } = require('./ether')

const SECONDS_IN_A_DAY = 60 * 60 * 24
const BigNumber = web3.BigNumber

const fakeOpeningTime = (offset = 0) =>
  Math.floor(new Date().getTime() / 1000) + offset

const crowdsaleData = ({ wallet, token, ...fields }) => {
  // const tokenSupply = new BigNumber('1e22')
  const openingTime = fields.openingTime || fakeOpeningTime()
  const closingTime = openingTime + SECONDS_IN_A_DAY
  // Usually this represents how many tokens 1 wei buys?
  // instead we need the rate to represent how many wei one token costs.
  const rate = new BigNumber(1)

  // usually this cap is represented in wei but we need it to be in USD.
  const cap = toWei(100)

  // usually the goal is represented in wei but we need it to be in USD.
  const goal = toWei(50)

  // just set a default dollar rate of half an ETH
  const dollarRate = toWei(0.5)

  const data = {
    openingTime,
    closingTime,
    rate,
    dollarRate,
    cap,
    goal,
    wallet,
    token,
    ...fields
  }

  return [
    data.openingTime,
    data.closingTime,
    data.rate,
    data.dollarRate,
    data.cap,
    data.goal,
    data.wallet,
    data.token
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
  fakeOpeningTime,
  crowdsaleData,
  makeCrowdsale
}
