# YIELDPOOL PROJECT - AVALANCHE HACKATHON 25-27 March 2022

## Goal of the project

### Primer 🧠


**YieldPool** lets you pool funds with your friends. Once the funds are gathered, via the YiedPool SC the pool manager decides on what farm to deploy the capital protection strategy. 
This is how it would work, when a 100k usdc pool is formed. 90k USDC are lent out to Beefy Finance to generate a 10k USDC yearly. This way the manager can invest 10k USDC in NFTs. 
Investors can leave the pool at any time and collect their shares. 
The successive iteration of YP will consist in the integration of a governance framework, where a manager submits its investment idea to the collective that votes on it. 
After implementing governance, the creation of capital protected pools can be serialized with the implementation of a factory contract, de facto posing YP as a protocol. 
Lastly, with an Axelar/LayerZero implementation, cross-chain farming will allow more opportunities to create capital protected pools. 

### Technical details ⚙️

Ideally pool is a continuous model as soon as it reaches initial capacity, meaning that at any point of the time anyone can enter and exit the pool. When the user exists the pool he immediately withdraw funds from farming and gets his share of the profits generated. We also issue share tokens for the nft basket, so if the nfts would be sold user still will be able to get part of the profits.

This way we can consider that the strategy is **delta neutral** in case if the price of nfts would not go down.

### Problems identified 🛠️

- There’s no fixed yield on stablecoins, we’d have to use stablecoin LPs to farm volatile tokens (Most probably using Benqi farming pools). We’d have to find a way to compound the yield. We need to have a public method to do this and expect that pool participants are incentivized to compound assets on a daily basis
- In classical capital protection note you’d be able to sell out proportional part of the option, but you cannot do this with NFT. One way to solve this can be fractionalizing NFTs. We can do so by issuing our own token for the share of the nft basket or trying to fork NFTX on avalanche
- Frontrunning of the pool buying assets on the secondary market



## Quick Start 🏁

**1. install your dependencies**

   ```bash
   yarn install
   ```
💡 if yarn is not already installed, check [the yarn website](https://classic.yarnpkg.com/lang/en/docs/install/#debian-stable)

**2. run the tests**
```bash
# Run all the tests
yarn test
```
The test will deploy automatically and you should see the transactions happening


## To run the tests 🧪

Finally, we can run all tests
```
yarn test
```

## More information!

- The Smart Contract files are in ```/packages/hardhat-ts/contracts/```

- run all test with ```yarn test```
