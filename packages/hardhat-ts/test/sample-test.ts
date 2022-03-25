import { expect } from 'chai';
import { ethers } from 'hardhat';

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

  it('transfet proper amount of token from user to contract', async function () {
    const initialSupply = 100;
    const amount = 65;

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];

    const USDC = await ethers.getContractFactory('USDC');
    const usdcInstance = await USDC.deploy(initialSupply);

    const StakingContract = await ethers.getContractFactory('contractv1');
    const stakingContract = await StakingContract.deploy();

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
  });
});
