// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract contractv1 {
  address constant USDC_ADDR = 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9;

  event TopUpDone(address indexed _from, uint256 _value);

  function stake(uint256 amount) public {
    ERC20(USDC_ADDR).transferFrom(msg.sender, address(this), amount);
    emit TopUpDone(msg.sender, amount);
  }
}
