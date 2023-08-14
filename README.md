# NFT Auction Smart Contract

This project contains a Solidity smart contract that represents a simple auction for an NFT (Non-fungible token). The smart contract allows for auction creation, bidding, and auction closure.

## Features

- **Auction Creation**: The contract owner can initiate an auction by setting the NFT for auction, specifying a minimum bid amount, and setting the auction end time.

- **Bidding**: Anyone can place a bid on the NFT as long as the bid is higher than the current highest bid and the auction is still active.

- **Auction Closure**: After the auction end time, the contract owner can close the auction, transfer the NFT to the highest bidder, and send the funds to themselves.

## Project Structure

- **/contracts**: This is the folder of the Smart contract files.
- **/scripts**: This is the folder of the deploy scripts.
- **/test**: This is the folder of the test scripts. 

## Prerequisites

Before getting started, ensure you have the following:

- Node.js and npm
- Ganache (for local blockchain development)
- Hardhat (for contract compilation, testing, and deployment)
- Prepare some account privateKeys and infuraKey which will be used to test. (Follow the .env.example) 

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/profullstackdeveloper/nft-auction-smart-contract.git

   cd nft-auction-smart-contract
   ```

2. Install dependencies:

    ```bash
    npm install
    ```

## Compile Smart contracts

To compile contracts, please use the following script:

```bash
npm run compile
```

## Deploy Smart contract

After compilation, deployment would be done by the following script:

```bash
npm run deploy:ganache    //For local test
npm run deploy:rinkeby    //For rinkeby deployment
npm run deploy:sepolia    //For sepolia deployment
```

After deployment, the result will be:
```bash
$ npm run deploy:sepolia

> deploy:sepolia
> npx hardhat run scripts/deploy.ts --network sepolia

NFTAuction deployed to 0xF0fBd9f160F200A37d7266d623369777225e4A22
```

## Verify Smart contract

To verify smart contract after deploying it, please follow the steps below:
```bash
$ npm run deploy:sepolia

> deploy:sepolia
> npx hardhat run scripts/deploy.ts --network sepolia

NFTAuction deployed to 0xEB103Cca1B7f03918090e6cE590BA76d165e8C23
```

With the address 0xEB103Cca1B7f03918090e6cE590BA76d165e8C23, please run the command below:
```bash
$ npx hardhat verify 0xEB103Cca1B7f03918090e6cE590BA76d165e8C23 --network sepolia
Successfully submitted source code for contract
contracts/NFTAuction.sol:NFTAuction at 0xEB103Cca1B7f03918090e6cE590BA76d165e8C23
for verification on the block explorer. Waiting for verification result...

Successfully verified contract NFTAuction on the block explorer.
https://sepolia.etherscan.io/address/0xEB103Cca1B7f03918090e6cE590BA76d165e8C23#code
```

As we can see here, we should use the address which we will get after deployment.
After verification, you can check it with this link:
>https://sepolia.etherscan.io/address/0xEB103Cca1B7f03918090e6cE590BA76d165e8C23#code

## Test smart contracts

To test the current contract, we can use the following script:
```bash
npm run test
```

Then the result  would be look like this:
```bash
NFTAuction
    Create Auction
      ✔ Only owner of that contract can create auction. (1354ms)
      ✔ When token is not approved to auction contract, error occurs
      ✔ When token is approved to auction contract, and token owner is not auction owner, error occurs
      ✔ When token is approved to auction contract, and token owner is not auction owner, error occurs
    Place a Bid
      ✔ If bid after the auction closed, then it is reverted with 'Auction already ended.' (43ms)
      ✔ If bid on the auction which is not exist, then it is reverted with 'Auction already ended.'
      ✔ If bid amount is smaller than minimal bid amount, then it will be reverted with 'Bid amount is too small.' (50ms)
      ✔ If bid amount is smaller that the highest bid amount, then it will be reverted with 'Bid amount should be higher than former one.' (48ms)
      ✔ After bid, contract should refund to the former bidder. (49ms)
      ✔ After successful bid, then it will emit event with name: 'BidMade' (39ms)
    Close Auction
      ✔ If auction doesn't exist, then it will be reverted with 'Auction doesn't exist for this token.'
      ✔ If auction is still in progress, then it will be reverted with 'Auction is still in progress!' (40ms)
      ✔ Once auction is closed, then it should send token to highest bidder (70ms)
      ✔ When the auction closed, then highest bidder should take the token. (59ms)
      ✔ When the auction is closed, then its data should be reset. (57ms)
      ✔ After auction closed successfuly, then it will emit an event with name of 'AuctionClosed' (50ms)


  16 passing (2s)
```

## Check contract

To check the current contract's problems, we can use the following script.

```bash
npm run check
```

If there is no problem, then it should be look like this:

```bash
npm run check

> check
> npx hardhat check
```

## Check the coverage for the test cases

To check how much percent of test cases cover branches, we can use the following script:

```bash
npm run coverage
```

Then the result would be look like this:
```bash
--------------------|----------|----------|----------|----------|----------------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------------|----------|----------|----------|----------|----------------|
 contracts\         |       84 |    84.38 |    72.22 |       70 |                |
  MakeBidAttack.sol |        0 |      100 |       20 |        0 |... 34,43,44,54 |
  NFTAuction.sol    |    95.24 |    86.67 |    90.91 |     93.1 |          54,58 |
  TestNFT.sol       |      100 |       50 |      100 |      100 |                |
--------------------|----------|----------|----------|----------|----------------|
All files           |       84 |    84.38 |    72.22 |       70 |                |
--------------------|----------|----------|----------|----------|----------------|
```

According to the result, we can see that 87.5 percent of branches are covered in current test cases for NFTAuction.sol file.