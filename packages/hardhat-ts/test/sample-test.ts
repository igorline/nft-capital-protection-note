import { expect } from 'chai';
import { ethers, network } from 'hardhat';

describe('YourContract', function () {
  it("Should return the new purpose once it's changed", async function () {
    const YourContract = await ethers.getContractFactory('YourContract');
    const yourContract = await YourContract.deploy();

    await yourContract.deployed();
    expect(await yourContract.purpose()).to.equal('Building Unstoppable Apps!!!');

    await yourContract.setPurpose('Hola, mundo!');
    expect(await yourContract.purpose()).to.equal('Hola, mundo!');
  });

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

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address);

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
    const stakingContractFork = await StakingContractFork.deploy(realUSDC.address);
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

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address);

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

    const tx3 = await stakingContract.withdraw(deployer.address, withdrawAmount);
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

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy(usdcInstance.address);

    const allowance = await usdcInstance.allowance(deployer.address, stakingContract.address);

    const tx = await usdcInstance.approve(stakingContract.address, amount);
    await tx.wait();

    const tx2 = await stakingContract.stake(amount);
    await tx2.wait();

    await expect(stakingContract.withdraw(deployer.address, withdrawAmount)).to.be.reverted;
  });
});
