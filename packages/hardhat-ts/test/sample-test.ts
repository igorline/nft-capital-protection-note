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
    const YourContract = await ethers.getContractFactory('USDCToken');
    const yourContract = await YourContract.deploy(initialSupply);

    const accounts = await ethers.getSigners();
    const deployer = accounts[0];

    const deployerBalance = await yourContract.balanceOf(deployer.address);

    expect(deployerBalance).to.equal(initialSupply);
  });
});
