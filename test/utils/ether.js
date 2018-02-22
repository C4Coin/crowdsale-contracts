const convert = (n, conversion) => new web3.BigNumber(conversion(n, 'ether'))
const toWei = n => convert(n, web3.toWei)
const fromWei = n => convert(n, web3.fromWei)

module.exports = {
  toWei,
  fromWei
}
