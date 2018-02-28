const { toWei } = require('./ether')

const SECONDS_IN_A_DAY = 60 * 60 * 24
const BigNumber = web3.BigNumber

const fakeOpeningTime = (offset = 0) =>
  Math.floor(new Date().getTime() / 1000) + offset

const crowdsaleData = ({ wallet, overpaymentWallet, token, ...fields }) => {
  // const tokenSupply = new BigNumber('1e22')
  const openingTime = fields.openingTime || fakeOpeningTime()
  const closingTime = openingTime + SECONDS_IN_A_DAY
  // Usually this represents how many tokens 1 wei buys?
  // instead we need the rate to represent how many wei one token costs.
  const rate = new BigNumber(1)

  // the default goal is represented in USD cents.
  const goal = fields.goal || new BigNumber(10000000 * 100)

  // the default cap is 3 times the goal.
  const cap = fields.cap || goal.times(3)

  // as a default let's say
  // current ETH rate is approx USD 850
  // so one dollar buys 0.001176470588 ETH
  // and thus one cent buys 0.00001176470588 ETH
  const usdConversionRate = toWei(0.00001176470588)

  const data = {
    openingTime,
    closingTime,
    rate,
    usdConversionRate,
    cap,
    goal,
    wallet,
    overpaymentWallet,
    token,
    ...fields
  }

  return [
    data.openingTime,
    data.closingTime,
    data.rate,
    data.usdConversionRate,
    data.cap,
    data.goal,
    data.wallet,
    data.overpaymentWallet,
    data.token
  ]
}

const makeCrowdsale = async (
  Crowdsale,
  { wallet, overpaymentWallet, token: tokenOrTokenAddress, ...fields }
) => {
  const token =
    tokenOrTokenAddress.address !== undefined
      ? tokenOrTokenAddress.address
      : tokenOrTokenAddress
  const crowdsale = await Crowdsale.new(
    ...crowdsaleData({ wallet, overpaymentWallet, token, ...fields })
  )
  return crowdsale
}

module.exports = {
  SECONDS_IN_A_DAY,
  fakeOpeningTime,
  crowdsaleData,
  makeCrowdsale
}
