// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IPangolinRouter.sol";
import "./IBeefyVault.sol";
import "./Ownable.sol";
import "hardhat/console.sol";

contract contractv1 {
  address public usdcAddr;
  address public ustAddr;

  // Init addresses
  address public constant PANGOLIN_ROUTER = 0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106;
  address public constant BEEFY_STAKE = 0x6399A5E96CD627404b203Ea80517C3F8F9F78Fe6;
  address public constant USDC_UST_LP = 0x3c0ECf5F430bbE6B16A8911CB25d898Ef20805cF;

  bool public strategyActive;

  // Init instances of Pangolin and Beefy for staking and changing tokens
  IPangolinRouter pangolinRouter = IPangolinRouter(PANGOLIN_ROUTER);
  IBeefyVault beefyVault = IBeefyVault(BEEFY_STAKE);

  // Declares the struct that will be used to store the staked amount of every user
  struct User {
    uint256 stakedAmount;
  }

  // Mapping the User struct to the address of the user
  mapping(address => User) data;

  uint256 public totalStake;

  // Initializing events
  event Staked(address indexed _from, uint256 _value);
  event Withdrawn(address indexed _to, uint256 _value);

  // Initializing errors
  error NotEnoughUSDC();
  error NotEnoughUSDCTransfered();

  // Init UST and USDC addresses
  constructor(address _usdcAddr, address _ustAddr) {
    usdcAddr = _usdcAddr;
    ustAddr = _ustAddr;
  }

  // Modifier to verify if there is enought USDC available
  modifier enoughUSDCAvailable(uint256 maxUsdcAmountToSpend) {
    uint256 currentBalance = IERC20(usdcAddr).balanceOf(address(this));
    uint256 maxUsdcAvailableToSpend = currentBalance / 2;

    if (maxUsdcAvailableToSpend < maxUsdcAmountToSpend) {
      revert NotEnoughUSDC();
    }
    _;
  }

  /**
   * Starts the farming process by putting the funds into the pool
   * checks if the funds are available and checks the USDT-USDC difference for errors
   *
   * @param maxUsdcAmountToSpend defines the max amount you are allowed to spend
   * @param minUstAmountToBuy defines the minimal amount of UST we need to buy
   *
   */
  function _startFarm(uint256 maxUsdcAmountToSpend, uint256 minUstAmountToBuy) internal enoughUSDCAvailable(maxUsdcAmountToSpend) {
    address[] memory path = new address[](2);
    path[0] = usdcAddr;
    path[1] = ustAddr;

    // Sets a deadline for the process
    uint256 deadline = block.timestamp;

    // If the transaction is under the max amount we want to spend, we approve the transaction
    if (IERC20(usdcAddr).allowance(address(this), PANGOLIN_ROUTER) < maxUsdcAmountToSpend) {
      IERC20(usdcAddr).approve(PANGOLIN_ROUTER, type(uint256).max);
    }

    // Change USDC to UST and keep the amount of UST we get
    uint256 boughtUST = pangolinRouter.swapExactTokensForTokens(maxUsdcAmountToSpend, minUstAmountToBuy, path, address(this), deadline)[1];

    if (IERC20(ustAddr).allowance(address(this), PANGOLIN_ROUTER) < boughtUST) {
      IERC20(ustAddr).approve(PANGOLIN_ROUTER, type(uint256).max);
    }

    // Add liquidity to the UST/USDC pool
    (, , uint256 liquidity) = pangolinRouter.addLiquidity(usdcAddr, ustAddr, maxUsdcAmountToSpend, boughtUST, 0, 0, address(this), deadline);

    if (IERC20(USDC_UST_LP).allowance(address(this), PANGOLIN_ROUTER) < liquidity) {
      IERC20(USDC_UST_LP).approve(BEEFY_STAKE, type(uint256).max);
    }

    // Deposit the funds inside the vault
    beefyVault.depositAll();
  }

  /**
   * Transfers the specifided amount to the pool,
   * incrementing the total supply
   *
   * emits a message on success
   *
   * @param amount defines the amount to stake
   *
   */
  function stake(uint256 amount) public {
    IERC20(usdcAddr).transferFrom(msg.sender, address(this), amount);
    adding_values(msg.sender, amount);
    totalStake += amount;
    emit Staked(msg.sender, amount);
  }

  /**
   * Withdraws money from the pool
   * -> change the BEEFY token to UST/USDC pool token to UST and USDC tokens to USDC token
   * -> give back the USDC to the user
   * reducing the total supply
   *
   * emits a message on success with the address and the amount withdrawn
   *
   * @param useraddr                specifies the address of the user wanting to withdraw
   * @param amount                  specifies the amount the user wants to withdraw
   * @param amountMinUST            The minimum amount of UST that must be received for the transaction not to revert.
   * @param amountMinUSDC           The minimum amount of USDC that must be received for the transaction not to revert.
   * @param minAmountUSDCTradeEND   ?¿
   *
   */
  function withdraw(
    address useraddr,
    uint256 amount,
    uint256 amountMinUST,
    uint256 amountMinUSDC,
    uint256 minAmountUSDCTradeEND
  ) public {
    if (strategyActive) {
      withdrawBeefy(useraddr, amount, amountMinUST, amountMinUSDC, minAmountUSDCTradeEND);
    } else {
      withdrawUnsettled(useraddr, amount);
    }
  }

  function withdrawBeefy(
    address useraddr,
    uint256 amount,
    uint256 amountMinUST,
    uint256 amountMinUSDC,
    uint256 minAmountUSDCTradeEND
  ) internal {
    data[useraddr].stakedAmount -= amount;
    uint256 totalBeefy = IERC20(BEEFY_STAKE).balanceOf(address(this));
    uint256 withdrawalAmount = (totalBeefy * amount) / totalStake;
    totalStake -= amount;

    // unstake beefy token
    if (IERC20(BEEFY_STAKE).allowance(address(this), BEEFY_STAKE) < withdrawalAmount) {
      IERC20(BEEFY_STAKE).approve(BEEFY_STAKE, type(uint256).max);
    }
    beefyVault.withdraw(withdrawalAmount);

    // init deadline
    uint256 deadline = block.timestamp;

    // get the balance of USDC_UST_LP
    uint256 pairBalance = IERC20(USDC_UST_LP).balanceOf(address(this));
    console.log(pairBalance);
    console.log(amountMinUST);
    console.log(amountMinUSDC);

    if (IERC20(USDC_UST_LP).allowance(address(this), PANGOLIN_ROUTER) < pairBalance) {
      IERC20(USDC_UST_LP).approve(PANGOLIN_ROUTER, type(uint256).max);
    }

    // removeLiquidity of the pool and get the amount of UST and USDC we receive
    (uint256 amountUST, uint256 amountUSDC) = pangolinRouter.removeLiquidity(
      ustAddr,
      usdcAddr,
      pairBalance,
      amountMinUST,
      amountMinUSDC,
      address(this),
      deadline
    );

    address[] memory path = new address[](2);
    path[0] = ustAddr;
    path[1] = usdcAddr;

    // change our UST into USDC token
    uint256 boughtUSDC = pangolinRouter.swapExactTokensForTokens(amountUST, 0, path, address(this), deadline)[1];

    // send all the USDC to the user
    if (boughtUSDC + amountUSDC < minAmountUSDCTradeEND) {
      revert NotEnoughUSDCTransfered();
    }

    IERC20(usdcAddr).transfer(msg.sender, boughtUSDC + amountUSDC);
    emit Withdrawn(msg.sender, boughtUSDC + amountUSDC);
  }

  function withdrawUnsettled(address useraddr, uint256 amount) internal {
    data[useraddr].stakedAmount -= amount;
    totalStake -= amount;
    IERC20(usdcAddr).transfer(msg.sender, amount);
    emit Withdrawn(msg.sender, amount);
  }

  /**
   * Define how much money is needed to buy the NFTs and put the other part in staking
   *
   * @param maxUsdcAmount   defines the max USDC we are allowing the contract to spend
   * @param minUstAmount    defines the lowest UST we want to get from this transaction
   *
   */
  function settle(uint256 maxUsdcAmount, uint256 minUstAmount) public {
    uint256 toStake = (90 * maxUsdcAmount) / 100;
    uint256 toBuyNFT = maxUsdcAmount - toStake;
    _startFarm(toStake, minUstAmount);

    /* address[] memory path = new address[](2);
    path[0] = usdcAddr;
    path[1] = usdcAddr;

    uint256 boughtAVAX = pangolinRouter.swapExactTokensForTokens(toBuyNFT, 0, path, address(this), deadline)[1]; */
  }

  /**
   * Adds value to the user table,
   * values being the address and the amount staked
   *
   * @param useraddr        defines the address of the user we want to add to the table
   * @param stakedAmount    defines the amount the user has staked
   *
   */
  function adding_values(address useraddr, uint256 stakedAmount) public {
    User storage user = data[useraddr];
    user.stakedAmount += stakedAmount;
  }

  /**
   * Retrieves data from the storage
   *
   * @param useraddr    defines the address of the user we want to get information from
   * @return data       returns the amount staked from the user specified by the address passed as argument
   *
   */
  function get_user_data(address useraddr) public view returns (User memory) {
    return data[useraddr];
  }
}
