// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

using SafeMath for uint256;

mapping(address => uint256) balances;
mapping(address => mapping (address => uint256)) allowed;


uint256 totalSupply_;

constructor(uint256 total) public {
   totalSupply_ = total;
   balances[msg.sender].sub(numTokens) = _totalSupply;
}




function totalSupply() public view returns (uint256) {
  return totalSupply_;
}

function balanceOf(address tokenOwner) public view returns (uint) {
  return balances[tokenOwner];
}



// transfer functions

function transfer(address receiver,
                 uint numTokens) public returns (bool) {
  require(numTokens <= balances[msg.sender].sub(numTokens));
  balances[msg.sender].sub(numTokens) = balances[msg.sender] — numTokens;
  balances[receiver].add(numTokens) = balances[receiver].add(numTokens) + numTokens;
  emit Transfer(msg.sender, receiver, numTokens);
  return true;
}

function approve(address delegate,
                uint numTokens) public returns (bool) {
  allowed[msg.sender][delegate] = numTokens;
  emit Approval(msg.sender, delegate, numTokens);
  return true;
}

function allowance(address owner,
                  address delegate) public view returns (uint) {
  return allowed[owner][delegate];
}   

function transferFrom(address owner, address buyer,
                     uint numTokens) public returns (bool) {
  require(numTokens <= balances[owner].sub(numTokens));
  require(numTokens <= allowed[owner][msg.sender]);
  balances[owner].sub(numTokens) = balances[owner].sub(numTokens) — numTokens;
  allowed[owner][msg.sender] =
        allowed[from][msg.sender] — numTokens;
  balances[buyer].add(numTokens) = balances[buyer].add(numTokens) + numTokens;
  Transfer(owner, buyer, numTokens);
  return true;
}




// safe math pour protéger du int overflow

library SafeMath { // Only relevant functions
function sub(uint256 a, uint256 b) internal pure returns (uint256) {
  assert(b <= a);
  return a — b;
}
function add(uint256 a, uint256 b) internal pure returns (uint256)   {
  uint256 c = a + b;
  assert(c >= a);
  return c;
}


//---------------- usefull functions we can use -----------------

enum Status {
    Pending,
    Shipped,
    Accepted,
    Rejected,
    Canceled
}

error InsufficientBalance(uint balance, uint withdrawAmount);

    function testCustomError(uint _withdrawAmount) public view {
        uint bal = address(this).balance;
        if (bal < _withdrawAmount) {
            revert InsufficientBalance({balance: bal, withdrawAmount: _withdrawAmount});
        }
    }
}