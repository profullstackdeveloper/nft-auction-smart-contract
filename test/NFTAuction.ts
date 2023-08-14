import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";

describe("NFTAuction", function () {
    async function deployNFTAuctionContract() {
        const [owner, user1, user2] = await ethers.getSigners();

        const NFTAuctionContract = await ethers.getContractFactory("NFTAuction");
        const nftAuctionContract = await NFTAuctionContract.deploy();

        const TestNFTContract = await ethers.getContractFactory("TestNFT");
        const testNFTContract = await TestNFTContract.connect(owner).deploy("TestNFT", "TN");

        const MakeBidAttackContract = await ethers.getContractFactory("MakeBidAttack");
        const makeBidAttackContract = await MakeBidAttackContract.connect(user1).deploy();

        // mint 1, 2 token to owner
        await testNFTContract.connect(owner).mint(owner.address, 1);
        await testNFTContract.connect(owner).mint(owner.address, 2);

        // mint 3 token to another 

        await testNFTContract.connect(owner).mint(user1.address, 3);

        return { nftAuctionContract, testNFTContract, owner, user1, user2, makeBidAttackContract }
    }


    describe("Create Auction", function () {
        it("Only owner of that contract can create auction.", async function () {

            const { nftAuctionContract, user1, testNFTContract } = await loadFixture(deployNFTAuctionContract);

            const oneMin = 60;

            const nftAddress = await testNFTContract.getAddress();

            const minLimitBidAmount = ethers.parseEther("10");
            // const tokenId = ethers.toBigInt("1");

            const currentDate = await time.latest();
            const auctionDeadline = ethers.toBigInt(currentDate + oneMin);
            await expect(nftAuctionContract.connect(user1).createAuction(
                nftAddress,
                1, // token id
                minLimitBidAmount,
                auctionDeadline,
            )).to.be.revertedWith(
                "Ownable: caller is not the owner"
            )
        });

        it("Creation timestamp should be bigger than current timestamp.", async function () {
            
            const { nftAuctionContract, owner, testNFTContract } = await loadFixture(deployNFTAuctionContract);

            const oneMin = 60;

            const nftAddress = await testNFTContract.getAddress();

            const minLimitBidAmount = ethers.parseEther("10");
            // const tokenId = ethers.toBigInt("1");

            const currentDate = await time.latest();
            const auctionDeadline = ethers.toBigInt(currentDate - oneMin);
            await expect(nftAuctionContract.connect(owner).createAuction(
                nftAddress,
                1, // token id
                minLimitBidAmount,
                auctionDeadline,
            )).to.be.revertedWith(
                "Auction end can't be less than current timestamp."
            )
        })

        it("When token is not approved to auction contract, error occurs", async function () {

            const { nftAuctionContract, owner, testNFTContract } = await loadFixture(deployNFTAuctionContract)
            const oneMin = 60;

            const nftAddress = await testNFTContract.getAddress();

            const minLimitBidAmount = ethers.parseEther("10");
            // const tokenId = ethers.toBigInt("1");

            const currentDate = await time.latest();
            const auctionDeadline = ethers.toBigInt(currentDate + oneMin);
            const tokenOwner = await testNFTContract.ownerOf(1);

            await expect(nftAuctionContract.connect(owner).createAuction(
                nftAddress,
                1,
                minLimitBidAmount,
                auctionDeadline
            )).to.be.revertedWith(
                "ERC721: caller is not token owner or approved"
            )
        })

        it("When token is approved to auction contract, and token owner is not auction owner, error occurs", async function () {

            const { nftAuctionContract, owner, testNFTContract, user1 } = await loadFixture(deployNFTAuctionContract)
            const oneMin = 60;

            const nftAddress = await testNFTContract.getAddress();

            const minLimitBidAmount = ethers.parseEther("10");
            // const tokenId = ethers.toBigInt("1");

            const currentDate = await time.latest();
            const auctionDeadline = ethers.toBigInt(currentDate + oneMin);

            // approve token 3 to auction contract
            await testNFTContract.connect(user1).approve(nftAuctionContract.getAddress(), 3)


            await expect(nftAuctionContract.connect(owner).createAuction(
                nftAddress,
                3,
                minLimitBidAmount,
                auctionDeadline
            )).to.be.revertedWith(
                "ERC721: transfer from incorrect owner"
            )
        })

        it("When token is approved to auction contract, and token owner is not auction owner, error occurs", async function () {

            const { nftAuctionContract, owner, testNFTContract, user1 } = await loadFixture(deployNFTAuctionContract)
            const oneMin = 60;

            const nftAddress = await testNFTContract.getAddress();

            const minLimitBidAmount = ethers.parseEther("10");
            // const tokenId = ethers.toBigInt("1");

            const currentDate = await time.latest();
            const auctionDeadline = ethers.toBigInt(currentDate + oneMin);

            // approve token 1 to auction contract
            await testNFTContract.connect(owner).approve(nftAuctionContract.getAddress(), 1)

            await expect(nftAuctionContract.connect(owner).createAuction(
                nftAddress,
                1,
                minLimitBidAmount,
                auctionDeadline
            )).to.emit(nftAuctionContract, "AuctionCreated")
        })


    })

    describe("Make a Bid", function () {
        it("If bid after the auction closed, then it is reverted with 'Auction already ended.'", async function () {
            const { nftAuctionContract, owner, user1, testNFTContract } = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, 10, auctionEnd);

            //Move forward the time to be after auctionEnd
            await time.increaseTo(timestamp + 60);

            await expect(nftAuctionContract.connect(user1).makeBid(nftAddress, 1)).to.be.revertedWith(
                "Auction already ended."
            )
        })

        it("If bid on the auction which is not exist, then it is reverted with 'Auction already ended.'", async function () {
            const {nftAuctionContract, user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();

            await expect(nftAuctionContract.connect(user1).makeBid(nftAddress, 1)).to.be.revertedWith(
                "Auction already ended."
            );
        })

        it("If account bid and became the highest bidder, then that account couldn't bid again.", async function () {
            const { nftAuctionContract, owner, user1, testNFTContract } = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, 10, auctionEnd);

            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: parseEther("0.1")
            });

            await expect(nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: parseEther("0.2")
            })).to.be.revertedWith("You are now highest bidder!")
        })

        it("If bid amount is smaller than minimal bid amount, then it will be reverted with 'Bid amount is too small.'", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, 10, auctionEnd);

            await expect(nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.toBigInt("8")
            })).to.be.revertedWith("Bid amount is too small.")
        })

        it("If bid amount is smaller that the highest bid amount, then it will be reverted with 'Bid amount should be higher than former one.'", async function () {
            const {nftAuctionContract,owner,  user1, user2, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, 10, auctionEnd);

            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.toBigInt("12")
            });

            await expect(nftAuctionContract.connect(user2).makeBid(nftAddress, 1, {
                value: ethers.toBigInt("11")
            })).to.be.revertedWith("Bid amount should be higher than former one.")

        })

        it("After bid, contract should refund to the former bidder.", async function () {
            const {nftAuctionContract,owner,  user1, user2, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);
            const user1BalanceBefore = await ethers.provider.getBalance(user1.address);

            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.parseEther("11")
            });

            

            await nftAuctionContract.connect(user2).makeBid(nftAddress, 1, {
                value: ethers.parseEther("12")
            });

            const user1BalanceAfter = await ethers.provider.getBalance(user1.address);

            expect(user1BalanceAfter).to.approximately(user1BalanceBefore, parseEther("0.001"));

        })

        it("After successful bid, then it will emit event with name: 'BidMade'", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);
            const user1BalanceBefore = await ethers.provider.getBalance(user1.address);

            await expect(nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.parseEther("11")
            })).to.emit(nftAuctionContract, "BidMade");
        })
    })

    describe("Close Auction", function () {
        it("If auction doesn't exist, then it will be reverted with 'Auction doesn't exist for this token.'", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();

            await expect(nftAuctionContract.connect(owner).closeAuction(nftAddress, 1)).to.be.revertedWith(
                "Auction doesn't exist for this token."
            )
        })

        it("If auction is still in progress, then it will be reverted with 'Auction is still in progress!'", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);

            // Move timestamp forward to 20 sec. Auction is still in progress.
            await time.increaseTo(timestamp + 20);

            await expect(nftAuctionContract.closeAuction(nftAddress, 1)).to.be.revertedWith(
                "Auction is still in progress!"
            );
        })

        it("Once auction is closed, then it should send token to highest bidder", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);
            
            //Owner's balance after create an auction.
            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

            //User1 bid this auction.
            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.parseEther('11')
            })

            //Move timestamp forward to 20 sec.
            await time.increaseTo(timestamp + 60);

            //Owner closed the auction.
            await nftAuctionContract.connect(owner).closeAuction(nftAddress, 1);

            //Owner's balance after close auction.
            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

            expect(ownerBalanceAfter - ownerBalanceBefore).to.approximately(parseEther('11'), parseEther('0.001'));

        })

        it("When the auction closed, then highest bidder should take the token.", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);
            
            //User1 bid this auction.
            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.parseEther('11')
            })

            //Move timestamp forward to 20 sec.
            await time.increaseTo(timestamp + 60);

            //Owner closed the auction.
            await nftAuctionContract.connect(owner).closeAuction(nftAddress, 1);

            const ownerOfToken = await testNFTContract.ownerOf(1);

            expect(ownerOfToken).to.eq(user1.address)
        });

        it("When the auction is closed, then its data should be reset.", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);
            
            //User1 bid this auction.
            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.parseEther('11')
            })

            //Move timestamp forward to 20 sec.
            await time.increaseTo(timestamp + 60);

            //Owner closed the auction.
            await nftAuctionContract.connect(owner).closeAuction(nftAddress, 1);

            const auctionData = await nftAuctionContract.getAuctionData(nftAddress, 1);

            expect(auctionData[0]).to.eq('0x0000000000000000000000000000000000000000');
        })

        it("After auction closed successfuly, then it will emit an event with name of 'AuctionClosed'", async function () {
            const {nftAuctionContract,owner,  user1, testNFTContract} = await loadFixture(deployNFTAuctionContract);

            const nftAddress = await testNFTContract.getAddress();
            const auctionContractAddress = await nftAuctionContract.getAddress();
            const timestamp = await time.latest();
            const auctionEnd = ethers.toBigInt(timestamp + 60);

            //Approve tokenID: 1 to the auction contract
            await testNFTContract.connect(owner).approve(auctionContractAddress, 1);

            //Create an auction
            await nftAuctionContract.connect(owner).createAuction(nftAddress, 1, ethers.parseEther("10"), auctionEnd);
            
            //User1 bid this auction.
            await nftAuctionContract.connect(user1).makeBid(nftAddress, 1, {
                value: ethers.parseEther('11')
            })

            //Move timestamp forward to 20 sec.
            await time.increaseTo(timestamp + 60);

            //Owner closed the auction.
            await expect(nftAuctionContract.connect(owner).closeAuction(nftAddress, 1)).to.emit(nftAuctionContract, 'AuctionClosed');
        })
    })
})