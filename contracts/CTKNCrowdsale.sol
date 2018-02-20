pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/RefundVault.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';


contract CTKNCrowdsale is CappedCrowdsale, RefundableCrowdsale {
    using SafeMath for uint256;

    RefundVault public refundWallet;

    mapping(address => uint256) private refunds;
    address[] private refundees;

    function Crowdsale(
        uint256 _cap,
        uint256 _goal,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _rate,
        address _wallet,
        address _refundWallet,
        MintableToken _token
    )
        /* CappedCrowdsale(_cap)
        RefundableCrowdsale(_goal)
        FinalizableCrowdsale(
            _startTime,
            _endTime,
            _rate, // how many wei per token
            _wallet,
            token
        ) */
        public
    {
        refundWallet = RefundVault(_refundWallet);
    }

    /**
     *  Any rounded off funds are able to claimed as a refund by the punter.
     */
    function claimRefund() public {
      require(isFinalized);

      refundWallet.refund(msg.sender);
    }

     /**
      *  Move Refund any refunds then do the other finalisation shite.
      */
    function finalization()
        internal
    {
        if (goalReached()) {
            refundWallet.close();
          } else {
            refundWallet.enableRefunds();
          }
        super.finalization();
    }

    function getTokenAmount(uint256 weiAmount) internal view returns(uint256) {
        return uint256(weiAmount.div(rate));
    }

    function getRefundAmount(uint256 weiAmount) internal view returns(uint256) {
        return weiAmount % rate;
    }

    function buyTokens(address beneficiary) public payable {
      require(beneficiary != address(0));
      require(validPurchase());

      uint256 weiAmount = msg.value;

      uint256 tokens = getTokenAmount(weiAmount);
      uint256 refund = getRefundAmount(weiAmount);

      weiRaised = weiRaised.add(weiAmount - refund);
      refundWallet.deposit.value(refund)(msg.sender);

      token.mint(beneficiary, tokens);
      TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

      forwardFunds();
    }
}
