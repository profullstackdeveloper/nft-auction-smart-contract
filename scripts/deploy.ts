import { ethers } from "hardhat";

async function main() {
  const nftAuctionContract = await ethers.deployContract("NFTAuction");

  await nftAuctionContract.waitForDeployment();

  console.log(
    `NFTAuction deployed to ${nftAuctionContract.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
