// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./CarbonCredit.sol";

contract CarbonMarketplace is ERC1155Holder, Ownable {
    uint256 private _listingIdCounter;
    CarbonCredit public carbonCredit;
    IERC20 public usdcToken;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 quantity;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;

    event Listed(
        uint256 listingId,
        uint256 tokenId,
        address seller,
        uint256 amount,
        uint256 price
    );
    event Sold(
        uint256 listingId,
        address seller,
        address buyer,
        uint256 amount,
        uint256 price
    );
    event Unlisted(uint256 listingId);

    constructor(address _carbonCredit, address _usdcToken) Ownable(msg.sender) {
        carbonCredit = CarbonCredit(_carbonCredit);
        usdcToken = IERC20(_usdcToken);
    }

    function createListing(
        uint256 tokenId,
        uint256 quantity,
        uint256 price
    ) external {
        require(
            carbonCredit.balanceOf(msg.sender, tokenId) >= quantity,
            "Insufficient balance"
        );
        require(
            carbonCredit.isApprovedForAll(msg.sender, address(this)),
            "Not approved"
        );

        _listingIdCounter++;
        listings[_listingIdCounter] = Listing(
            tokenId,
            msg.sender,
            quantity,
            price,
            true
        );

        carbonCredit.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            quantity,
            ""
        );
        emit Listed(_listingIdCounter, tokenId, msg.sender, quantity, price);
    }

    function purchase(uint256 listingId, uint256 quantity) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.quantity >= quantity, "Insufficient amount of listings");

        uint256 totalPrice = listing.price * quantity;
        require(
            usdcToken.allowance(msg.sender, address(this)) >= totalPrice,
            "Insufficient allowance"
        );

        usdcToken.transferFrom(msg.sender, listing.seller, totalPrice);
        carbonCredit.safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            quantity,
            ""
        );

        listing.quantity -= quantity;
        if (listing.quantity == 0) {
            listing.active = false;
            emit Unlisted(listingId);
        }

        emit Sold(listingId, listing.seller, msg.sender, quantity, totalPrice);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Not the seller");
        require(listing.active, "Listing not active");

        carbonCredit.safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId,
            listing.quantity,
            ""
        );
        listing.active = false;

        emit Unlisted(listingId);
    }
}
