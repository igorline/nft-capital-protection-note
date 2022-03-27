import { expect } from 'chai';
import { ethers, network } from 'hardhat';

const realUSDCAddress = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E';
const realUSTAddress = '0x260Bbf5698121EB85e7a74f2E45E16Ce762EbE11';

describe('YourContract', function () {
  it('mints proper amount of token to deployer on deploy', async function () {
    const initialSupply = 100;
    const USDC = await ethers.getContractFactory('USDC');
    const usdcInstance = await USDC.deploy(initialSupply);

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];

    const deployerBalance = await usdcInstance.balanceOf(deployer.address);

    expect(deployerBalance).to.equal(initialSupply);
  });

  it('transfer proper amount of token from user to contract', async function () {
    const initialSupply = 100;
    const amount = 65;

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];

    const USDC = await ethers.getContractFactory('USDC');
    const usdcInstance = await USDC.deploy(initialSupply);
    const usdtInstance = await USDC.deploy(initialSupply);

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address, usdtInstance.address);

    const allowance = await usdcInstance.allowance(deployer.address, stakingContract.address);

    expect(allowance).to.equal(0);

    const tx = await usdcInstance.approve(stakingContract.address, amount);
    await tx.wait();

    const allowanceAfterApproval = await usdcInstance.allowance(deployer.address, stakingContract.address);

    expect(allowanceAfterApproval).to.equal(amount);

    const tx2 = await stakingContract.stake(amount);
    await tx2.wait();

    const contractBalance = await usdcInstance.balanceOf(stakingContract.address);
    const userBalance = await usdcInstance.balanceOf(deployer.address);
    expect(userBalance).to.equal(initialSupply - amount);
    expect(contractBalance).to.equal(amount);

    await network.provider.request({
      method: 'hardhat_reset',
      params: [
        {
          forking: {
            jsonRpcUrl: 'https://rpc.ankr.com/avalanche',
            blockNumber: 12574834,
          },
        },
      ],
    });

    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: ['0xbf14db80d9275fb721383a77c00ae180fc40ae98'],
    });

    const signer = await ethers.getSigner('0xbf14db80d9275fb721383a77c00ae180fc40ae98');

    const RealUSDC = await ethers.getContractFactory('ERC20');
    const realUSDC = RealUSDC.attach('0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E');

    const StakingContractFork = await ethers.getContractFactory('contractv1');
    const stakingContractFork = await StakingContractFork.deploy(realUSDCAddress, realUSTAddress);
    const impStakingContract = stakingContractFork.connect(signer);

    const userBalanceForkBeforeTx = await realUSDC.balanceOf(signer.address);

    await (await realUSDC.connect(signer).approve(stakingContractFork.address, amount)).wait();
    const tx3 = await impStakingContract.connect(signer).stake(amount);
    tx3.wait();

    const contractBalanceFork = await realUSDC.balanceOf(stakingContractFork.address);
    const userBalanceFork = await realUSDC.balanceOf(signer.address);

    expect(contractBalanceFork).to.equal(amount);
    expect(userBalanceFork).to.equal(userBalanceForkBeforeTx - amount);
  });

  it('check withdraw with one user', async function () {
    const initialSupply = 100 * Math.pow(10, 6);
    const amount = 65 * Math.pow(10, 6);
    const withdrawAmount: number = 20 * Math.pow(10, 6);

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];

    const USDC = await ethers.getContractFactory('USDC');
    const usdcInstance = await USDC.deploy(initialSupply);
    const ustInstance = await USDC.deploy(initialSupply);

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address, ustInstance.address);

    const allowance = await usdcInstance.allowance(deployer.address, stakingContract.address);

    expect(allowance).to.equal(0);
    expect(await stakingContract.totalStake()).to.equal(0);

    const tx = await usdcInstance.approve(stakingContract.address, amount);
    await tx.wait();

    const allowanceAfterApproval = await usdcInstance.allowance(deployer.address, stakingContract.address);

    expect(allowanceAfterApproval).to.equal(amount);

    const tx2 = await stakingContract.stake(amount);
    await tx2.wait();

    const contractBalance = await usdcInstance.balanceOf(stakingContract.address);
    const userBalance: string = await usdcInstance.balanceOf(deployer.address);

    expect(userBalance).to.equal(initialSupply - amount);
    expect(contractBalance).to.equal(amount);
    expect(await stakingContract.totalStake()).to.equal(amount);

    const oldUserBalance = await usdcInstance.balanceOf(deployer.address);

    const tx3 = await stakingContract.withdraw(deployer.address, withdrawAmount, 0, 0, 0);
    await tx3.wait();

    const newUserBalance = await usdcInstance.balanceOf(deployer.address);
    expect(newUserBalance).to.equal(parseInt(userBalance) + withdrawAmount);

    expect(await stakingContract.totalStake()).to.equal(amount - withdrawAmount);
  });

  it('Try withdraw more than staked', async function () {
    const initialSupply = 100 * Math.pow(10, 6);
    const amount = 65 * Math.pow(10, 6);
    const withdrawAmount = 70 * Math.pow(10, 6);

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];

    const USDC = await ethers.getContractFactory('USDC');
    const usdcInstance = await USDC.deploy(initialSupply);
    const usdtInstance = await USDC.deploy(initialSupply);

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address, usdtInstance.address);

    const allowance = await usdcInstance.allowance(deployer.address, stakingContract.address);

    const tx = await usdcInstance.approve(stakingContract.address, amount);
    await tx.wait();

    const tx2 = await stakingContract.stake(amount);
    await tx2.wait();

    await expect(stakingContract.withdraw(deployer.address, withdrawAmount, 0, 0, 0)).to.be.reverted;
  });

  it('Try withdraw other userAddress', async function () {
    const initialSupply = 100 * Math.pow(10, 6);
    const amount = 65 * Math.pow(10, 6);
    const withdrawAmount = 70 * Math.pow(10, 6);

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const deployer1 = accounts[1];

    const USDC = await ethers.getContractFactory('USDC');
    const usdcInstance = await USDC.deploy(initialSupply);
    const usdtInstance = await USDC.deploy(initialSupply);

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address, usdtInstance.address);

    const allowance = await usdcInstance.allowance(deployer.address, stakingContract.address);

    const tx = await usdcInstance.approve(stakingContract.address, amount);
    await tx.wait();

    const tx2 = await stakingContract.stake(amount);
    await tx2.wait();

    await expect(stakingContract.withdraw(deployer1.address, withdrawAmount)).to.be.reverted;
  });

  it('settles and starts farm', async function () {
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: ['0xbf14db80d9275fb721383a77c00ae180fc40ae98'],
    });

    const signer = await ethers.getSigner('0xbf14db80d9275fb721383a77c00ae180fc40ae98');

    const RealUSDC = await ethers.getContractFactory('ERC20');
    const realUSDC = RealUSDC.attach(realUSDCAddress);

    const StakingContractFork = await ethers.getContractFactory('contractv1');
    const stakingContractFork = await StakingContractFork.deploy(realUSDCAddress, realUSTAddress);
    const impStakingContract = stakingContractFork.connect(signer);

    const amount = ethers.utils.parseUnits('65', 6);
    await (await realUSDC.connect(signer).approve(stakingContractFork.address, amount)).wait();
    const tx3 = await impStakingContract.connect(signer).stake(amount);
    tx3.wait();

    const settleTx = await stakingContractFork.settle(amount.div(2), '0');
    await settleTx.wait();
  });

  it('all put in staking and withdraw process', async function () {
    await network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: ['0xbf14db80d9275fb721383a77c00ae180fc40ae98'],
    });

    const signer = await ethers.getSigner('0xbf14db80d9275fb721383a77c00ae180fc40ae98');

    const RealUSDC = await ethers.getContractFactory('ERC20');
    const realUSDC = RealUSDC.attach(realUSDCAddress);

    const StakingContractFork = await ethers.getContractFactory('contractv1');
    const stakingContractFork = await StakingContractFork.deploy(realUSDCAddress, realUSTAddress);
    const impStakingContract = stakingContractFork.connect(signer);

    const amount = ethers.utils.parseUnits('65', 6);
    await (await realUSDC.connect(signer).approve(stakingContractFork.address, amount)).wait();
    const tx3 = await impStakingContract.connect(signer).stake(amount);
    tx3.wait();

    const settleTx = await stakingContractFork.settle(amount.div(2), '0');
    await settleTx.wait();

    const amountToWithdraw = ethers.utils.parseUnits('5', 6);
    const withdrawTx = await impStakingContract.withdraw(signer.address, amountToWithdraw, 0, 0, 0);
    await withdrawTx.wait();
  });
});
