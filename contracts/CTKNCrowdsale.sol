pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/utils/RefundVault.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';


contract CTKNCrowdsale is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale {
    using SafeMath for uint256;

    // the number of wei one US Dollar buys.
    uint256 public dollarRate;

    // use this for overpayments, separate from the refunds in RefundableCrowdsale
    RefundVault private overpaymentVault;

    /**
     *  Fired when the `dollarRate` is set.
     *  @param _dollarRate  number of wei one US Dollar buys.
     */
    event DollarRateSet(uint256 _dollarRate);

    /**
     *  @notice Constructor
     *  @param _openingTime The time the Crowdsale starts.
     *  @param _closingTime The time the Crowdsale ends.
     *  @param _rate  The number of `wei` needed to buy one token.
     *  @param _dollarRate The USD to ETH conversion rate.
     *  @param _cap  The maximum amount of `wei` to be raised.
     *               TODO: this will change to be expressed in USD
     *  @param _goal The minimum amout of `wei` to be raised for the
     *               Crowdsale to allow distribution of tokens.
     *               TODO: this will change to be expressed in USD
     *  @param _wallet The address to be used to hold the `wei` being deposited to buy tokens.
     *  @param _overpaymentWallet The address to be used to hold the `wei`
     *                            coming from indivudual overpayments.
     *  @param _token The MintableToken to be bought.
     */
    function CTKNCrowdsale(
        uint256 _openingTime,
        uint256 _closingTime,
        uint256 _rate,
        uint256 _dollarRate,
        uint256 _cap,
        uint256 _goal,
        address _wallet,
        address _overpaymentWallet,
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
        overpaymentVault = new RefundVault(_overpaymentWallet);
        dollarRate = _dollarRate;
    }

    /**
     *  Sets the dollarRate.
     *  Emits `DollarRateSet`.
     *  @param _dollarRate the number of `wei` one US Dollar can buy.
     */
    function setDollarRate(uint256 _dollarRate)
        public
        onlyOwner
    {
        require(_dollarRate != 0);
        dollarRate = _dollarRate;
        DollarRateSet(dollarRate);
    }

    /**
     *  Get the amount the given address has overpaid.
     *  @param addr The address to check for an overpayment balance
     *  @return the number of `wei` the address overpaid when buying tokens.
     */
    function overpaymentBalance(address addr) external view returns (uint256) {
        return overpaymentVault.deposited(addr);
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
        if (overpaymentVault.deposited(msg.sender) != 0) {
            overpaymentVault.refund(msg.sender);
        }
    }

    /**
     *  Overrides `RefundableCrowdsale` finalization task,
     *  called when owner calls `finalize()`
     *  Simply enables refunds on the overpayment vault then invokes `super.finalization()`
     */
    function finalization() internal {
        overpaymentVault.enableRefunds();
        super.finalization();
    }

    /**
     * Overrides `RefundableCrowdsale` fund forwarding.
     * sends the correct funds to both the vault, and the overpaymentVault.
     */
    function _forwardFunds() internal {
        uint256 depositValue = _getTokenAmount(msg.value).mul(rate);
        uint256 overpaymentValue = _getOverpaymentAmount(msg.value);
        vault.deposit.value(depositValue)(msg.sender);
        overpaymentVault.deposit.value(overpaymentValue)(msg.sender);
    }

    /**
     *  In this contract the `rate` represents the number of wei needed to buy one token.
     *  Therefore this function returns the floor of `_weiAmount` / `rate`.
     *  Fractions of tokens can not be sold.
     *  @param _weiAmount Value in wei to be converted into tokens
     *  @return the whole number of tokens that can be purchased with the specified _weiAmount
     */
    function _getTokenAmount(uint256 _weiAmount) internal view returns (uint256) {
      return uint256(_weiAmount / rate);
    }

    /**
     *  We can only issue whole numbers of tokens, so any additional wei.
     *  needs to be refundable once the crowdsale has closed.
     *  @param _weiAmount Value in wei to be converted into tokens
     *  @return the wei amount in excess of what was needed to buy a whole number of tokens.
     */
    function _getOverpaymentAmount(uint256 _weiAmount) internal view returns (uint256) {
      return _weiAmount % rate;
    }

}
