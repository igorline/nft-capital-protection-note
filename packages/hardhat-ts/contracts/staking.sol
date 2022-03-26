// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract contractv1 {
  address public USDC_ADDR;

  constructor(address _USDC_ADDR) {
    USDC_ADDR = _USDC_ADDR;
  }

  event TopUpDone(address indexed _from, uint256 _value);

  function stake(uint256 amount) public {
    IERC20(USDC_ADDR).transferFrom(msg.sender, address(this), amount);
    emit TopUpDone(msg.sender, amount);
  }

  /* function retrieveTokens(address _token) public payable {
    require(msg.sender == owner);
    ERC20 erctoken = ERC20(_token);
    erctoken.transfer(Vault, erctoken.balanceOf(this));
  } */
}
