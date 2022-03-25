pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDCToken is ERC20 {
  constructor(uint256 initialSupply) ERC20("USDCOIN", "USDC") {
    _mint(msg.sender, initialSupply);
  }
}
