// solhint-disable no-empty-blocks
pragma solidity ^0.4.19;

import '../CTKNCrowdsale.sol';


/**
 *  A mock version of the CTKNCrowdsale contract that allows the
 *  opening and closing times to be wound back to allow testing of
 *  time dependent logic.
 */
contract MockCTKNCrowdsaleWithMutableDates is CTKNCrowdsale {

    /**
     *  @notice Constructor
     *  @param _openingTime The time the Crowdsale starts.
     *  @param _closingTime The time the Crowdsale ends.
     *  @param _rate  The number of `wei` needed to buy one token.
     *  @param _usdConversionRate The USD to ETH conversion rate.
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
    function MockCTKNCrowdsaleWithMutableDates(
        uint256 _openingTime,
        uint256 _closingTime,
        uint256 _rate,
        uint256 _usdConversionRate,
        uint256 _cap,
        uint256 _goal,
        address _wallet,
        address _overpaymentWallet,
        MintableToken _token
    )
        public
        CTKNCrowdsale(
            _openingTime,
            _closingTime,
            _rate,
            _usdConversionRate,
            _cap,
            _goal,
            _wallet,
            _overpaymentWallet,
            _token
        )
    {
        // empty by design
    }

    /**
     *  Wind the clock back to allow testing of time dependent logic.
     *  @param secs The number of seconds to wind back the `openingTime` and `closingTime`.
     */
    function turnBackTime(uint256 secs) external {
        openingTime -= secs;
        closingTime -= secs;
    }
}
