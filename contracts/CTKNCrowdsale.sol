pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/utils/RefundVault.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';


contract CTKNCrowdsale is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale {
    using SafeMath for uint256;

    uint256 public dollarRate;

    // use this for overpayments, separate from the refunds in RefundableCrowdsale
    RefundVault private refundWallet;

    event DollarRateSet(uint256 dollarRate);

    function CTKNCrowdsale(
        uint256 _openingTime,
        uint256 _closingTime,
        uint256 _rate,
        uint256 _dollarRate,
        uint256 _cap,
        uint256 _goal,
        address _wallet,
        address _refundWallet,
        MintableToken _token
    )
        public
        Crowdsale(_rate, _wallet, _token)
        CappedCrowdsale(_cap)
        TimedCrowdsale(_openingTime, _closingTime)
        RefundableCrowdsale(_goal)
    {
        require(_goal <= _cap);
        require(_dollarRate != 0);
        refundWallet = new RefundVault(_refundWallet);
        dollarRate = _dollarRate;
    }

    function setDollarRate(uint256 _dollarRate)
        public
        onlyOwner
    {
        require(_dollarRate != 0);
        dollarRate = _dollarRate;
        DollarRateSet(dollarRate);
    }

    /**
     *  @param addr The address to check for a refund balance
     */
    function refundBalance(address addr) external view returns (uint256) {
        return refundWallet.deposited(addr);
    }

    /**
     * Investors can claim refunds. This overrides `RefundableCrowdsale` `claimRefund`
     * 1. if crowdsale is unsuccessful refunds the amount they spent on tokens
     * 2. it will also refund the additional amount they deposited over what was spent on tokens.
     */
    function claimRefund() public {
        require(isFinalized);
        if (!goalReached() && vault.deposited(msg.sender) != 0) {
            vault.refund(msg.sender);
        }
        if (refundWallet.deposited(msg.sender) != 0) {
            refundWallet.refund(msg.sender);
        }
    }

    /**
     *  Overrides `RefundableCrowdsale` finalization task,
     *  called when owner calls `finalize()`
     *  simply enables refunds on the refund vault then invokes `super.finalization()`
     */
    function finalization() internal {
        refundWallet.enableRefunds();
        super.finalization();
    }

    /**
     * Overrides `RefundableCrowdsale` fund forwarding.
     * sends the correct funds to both the vault, and the refundWallet.
     */
    function _forwardFunds() internal {
        uint256 depositValue = _getTokenAmount(msg.value);
        uint256 refundValue = _getRefundAmount(msg.value);
        vault.deposit.value(depositValue)(msg.sender);
        refundWallet.deposit.value(refundValue)(msg.sender);
    }

    /**
     *  In this contract the `rate` represents the number of wei needed to buy one token.
     *  Therefore this function returns te floor of `_weiAmount` / `rate`
     *  @param _weiAmount Value in wei to be converted into tokens
     *  @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
      return uint256(_weiAmount / rate);
    }

    /**
     *  We can only issue whole numbers of tokens, so any additional wei.
     *  needs to be refundable once the crowdsale has closed.
     *  @param _weiAmount Value in wei to be converted into tokens
     *  @return Number of tokens that can be purchased with the specified _weiAmount
     */
    function _getRefundAmount(uint256 _weiAmount) internal view returns (uint256) {
      return _weiAmount % rate;
    }

}
