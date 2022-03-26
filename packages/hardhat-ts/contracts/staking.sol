// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract contractv1 {
  address public USDC_ADDR;

  struct User {
    uint256 stakedAmount;
  }

  mapping(address => User) data;
  uint256 public totalStake;

  event TopUpDone(address indexed _from, uint256 _value);
  event withdrawalOK(address indexed _from, uint256 _value);

  constructor(address _USDC_ADDR) {
    USDC_ADDR = _USDC_ADDR;
  }

  function stake(uint256 amount) public {
    IERC20(USDC_ADDR).transferFrom(msg.sender, address(this), amount);
    adding_values(msg.sender, amount);
    totalStake += amount;
    emit TopUpDone(msg.sender, amount);
  }

  function withdraw(address useraddr, uint256 amount) public {
    data[useraddr].stakedAmount -= amount;
    totalStake -= amount;
    uint256 totalAmount = IERC20(USDC_ADDR).balanceOf(address(this));
    uint256 withdrawalAmount = (totalAmount * amount) / totalAmount;

    IERC20(USDC_ADDR).transfer(msg.sender, withdrawalAmount);
    emit withdrawalOK(msg.sender, withdrawalAmount);
  }

  function adding_values(address useraddr, uint256 stakedamount) public {
    User storage user = data[useraddr];
    user.stakedAmount += stakedamount;
  }

  function get_user_data(address useraddr) public view returns (User memory) {
    return data[useraddr];
  }
}
