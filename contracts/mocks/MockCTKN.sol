pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';


/**
 *  A mock token used in testing.
 */
contract MockCTKN is MintableToken {
    string public constant name = 'CO2KN, INC Shares (indivisible)'; //solhint-disable-line const-name-snakecase
    string public constant symbol = 'CO2KN'; //solhint-disable-line const-name-snakecase
    uint256 public constant decimals = 0; //solhint-disable-line const-name-snakecase
}
