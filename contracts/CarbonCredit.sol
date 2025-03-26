// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonCredit is ERC1155, Ownable {
    uint256 private _creditId;

    enum VerificationStandard {
        VERRA,
        GoldStandard,
        PlanVivo,
        ClimateActionReserve,
        AmericanCarbonRegistry,
        VerifiedCarbonStandard
    }

    struct Credit {
        string projectName;
        string location;
        uint256 totalSupply;
        uint256 vintage;
        VerificationStandard verificationStandard;
        string metadataURI;
        bool isVerified;
        uint256 price;
    }

    address public usdcToken;

    mapping(uint256 => Credit) public credits;

    mapping(address => bool) public verifiers;

    event CreditMinted(
        uint256 tokenId,
        address creator,
        string projectName,
        uint256 amount,
        uint256 vintage
    );
    event CreditVerified(uint256 tokenId, address verifier);

    constructor(address _usdcToken) ERC1155("") Ownable(msg.sender) {
        usdcToken = _usdcToken;
        verifiers[msg.sender] = true;
    }

    function addVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = true;
    }

    function removeVerifier(address verifier) external onlyOwner {
        verifiers[verifier] = false;
    }

    function mintCredit(
        string memory projectName,
        string memory location,
        uint256 amount,
        uint256 vintage,
        VerificationStandard verificationStandard,
        string memory metadataURI,
        uint256 price
    ) external returns (uint256) {
        _creditId++;
        uint256 newCreditId = _creditId;

        credits[newCreditId] = Credit(
            projectName,
            location,
            amount,
            vintage,
            verificationStandard,
            metadataURI,
            false,
            price
        );

        _mint(msg.sender, newCreditId, amount, "");
        emit CreditMinted(newCreditId, msg.sender, projectName, amount, vintage);

        return newCreditId;
    }

    function verifyCredit(uint256 tokenId) external {
        require(verifiers[msg.sender], "Not a verifier");
        credits[tokenId].isVerified = true;
        emit CreditVerified(tokenId, msg.sender);
    }
}
