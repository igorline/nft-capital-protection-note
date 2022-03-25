// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract contractv1 {
    address constant USDC_ADDR = 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E;
   
    event TopUpDone(address indexed _from, uint _value);

    function stake(uint amount) public {
        ERC20(USDC_ADDR).transferFrom(msg.sender, address(this), amount);
        emit TopUpDone(msg.sender, amount);
    }
}