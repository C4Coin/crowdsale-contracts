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

    event DollarRateSet(uint256 dollarRate);

    function CTKNCrowdsale(
        uint256 _openingTime,
        uint256 _closingTime,
        uint256 _rate,
        uint256 _dollarRate,
        uint256 _cap,
        uint256 _goal,
        address _wallet,
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
}
