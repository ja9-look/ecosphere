// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CarbonCreditSwap
 * @dev A contract that enables atomic swaps between carbon credit NFTs and USDC
 */

contract CarbonCreditSwap is Ownable, ReentrancyGuard {
    IERC721 public carbonCreditContract;
    IERC20 public usdcContract;
    
    event SwapExecuted(
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 price
    );

    constructor(
        address _carbonCreditContract,
        address _usdcContract
    ) Ownable(msg.sender) ReentrancyGuard() {
        require(_carbonCreditContract != address(0), "Invalid carbon credit contract");
        require(_usdcContract != address(0), "Invalid USDC contract");
        
        carbonCreditContract = IERC721(_carbonCreditContract);
        usdcContract = IERC20(_usdcContract);
    }
    
    function executeSwap(uint256 tokenId, uint256 price, address seller) external nonReentrant {
        require(price > 0, "Price must be greater than zero");
        require(carbonCreditContract.ownerOf(tokenId) == seller, "Seller is not the owner");
        require(
            carbonCreditContract.getApproved(tokenId) == address(this) || 
            carbonCreditContract.isApprovedForAll(seller, address(this)),
            "NFT not approved for transfer"
        );
        
        require(
            usdcContract.transferFrom(msg.sender, seller, price),
            "USDC transfer failed"
        );
        
        carbonCreditContract.safeTransferFrom(seller, msg.sender, tokenId);
        
        emit SwapExecuted(seller, msg.sender, tokenId, price);
    }
}