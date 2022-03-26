// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IPangolinRouter.sol";
import "./IBeefyVault.sol";

contract contractv1 {
  address public usdcAddr;
  address public ustAddr;

  address public constant PANGOLIN_ROUTER = 0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106;
  address public constant BEEFY_STAKE = 0x6399A5E96CD627404b203Ea80517C3F8F9F78Fe6;
  address public constant USDC_UST_LP = 0x3c0ECf5F430bbE6B16A8911CB25d898Ef20805cF;

  IPangolinRouter pangolinRouter = IPangolinRouter(PANGOLIN_ROUTER);
  IBeefyVault beefyVault = IBeefyVault(BEEFY_STAKE);

  struct User {
    uint256 stakedAmount;
  }

  mapping(address => User) data;
  uint256 public totalStake;

  event Staked(address indexed _from, uint256 _value);
  event Withdrawn(address indexed _to, uint256 _value);

  error NotEnoughUSDC();

  constructor(address _usdcAddr, address _ustAddr) {
    usdcAddr = _usdcAddr;
    ustAddr = _ustAddr;
  }

  modifier enoughUSDCAvailable(uint maxUsdcAmountToSpend) {
    uint256 currentBalance = _getUSDCBalance();
    uint256 maxUsdcAvailableToSpend = currentBalance / 2;

    if (maxUsdcAvailableToSpend < maxUsdcAmountToSpend) {
      revert NotEnoughUSDC();
    }
    _;
  }

  function _startFarm(uint maxUsdcAmountToSpend, uint minUstAmountToBuy) internal enoughUSDCAvailable(maxUsdcAmountToSpend) {
    address[] memory path = new address[](2);
    path[0] = usdcAddr;
    path[1] = ustAddr;

    uint256 deadline = block.timestamp + 10 * 60;

    uint256 currentBalance = _getUSDCBalance();
    uint256 maxUsdcAvailableToSpend = currentBalance / 2;

    if (IERC20(usdcAddr).allowance(address(this), PANGOLIN_ROUTER) < maxUsdcAmountToSpend) {
      IERC20(usdcAddr).approve(PANGOLIN_ROUTER, type(uint256).max);
    }

    uint boughtUST = pangolinRouter.swapExactTokensForTokens(maxUsdcAmountToSpend, minUstAmountToBuy, path, address(this), deadline)[1];

    if (IERC20(ustAddr).allowance(address(this), PANGOLIN_ROUTER) < boughtUST) {
      IERC20(ustAddr).approve(PANGOLIN_ROUTER, type(uint256).max);
    }

    (, , uint liquidity) = pangolinRouter.addLiquidity(usdcAddr, ustAddr, maxUsdcAmountToSpend, boughtUST, 0, 0, address(this), deadline);

    if (IERC20(USDC_UST_LP).allowance(address(this), PANGOLIN_ROUTER) < liquidity) {
      IERC20(USDC_UST_LP).approve(BEEFY_STAKE, type(uint256).max);
    }

    beefyVault.depositAll();
  }

  function _getUSDCBalance() internal returns (uint256) {
    return IERC20(usdcAddr).balanceOf(address(this));
  }

  function stake(uint256 amount) public {
    IERC20(usdcAddr).transferFrom(msg.sender, address(this), amount);
    adding_values(msg.sender, amount);
    totalStake += amount;
    emit Staked(msg.sender, amount);
  }

  function withdraw(address useraddr, uint256 amount) public {
    data[useraddr].stakedAmount -= amount;
    totalStake -= amount;
    uint256 totalAmount = _getUSDCBalance();
    uint256 withdrawalAmount = (totalAmount * amount) / totalAmount;

    IERC20(usdcAddr).transfer(msg.sender, withdrawalAmount);
    emit Withdrawn(msg.sender, withdrawalAmount);
  }

  function settle(uint maxUsdcAmount, uint minUsdtAmount) public {
    _startFarm(maxUsdcAmount, minUsdtAmount);
  }

  function adding_values(address useraddr, uint256 stakedamount) public {
    User storage user = data[useraddr];
    user.stakedAmount += stakedamount;
  }

  function get_user_data(address useraddr) public view returns (User memory) {
    return data[useraddr];
  }
}
