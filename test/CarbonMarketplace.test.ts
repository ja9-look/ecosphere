import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CarbonCredit, CarbonMarketplace, MockUSDC } from "../typechain-types";

describe("CarbonMarketplace", function () {
  let carbonCredit: CarbonCredit;
  let carbonMarketplace: CarbonMarketplace;
  let mockUSDC: MockUSDC;
  let verifier: Signer;
  let seller: Signer;
  let buyer: Signer;

  const PROJECT_NAME = "Cabo Leones Wind Farm";
  const LOCATION = "Chile";
  const TOTAL_SUPPLY = 5000;
  const QUANTITY = 100;
  const VINTAGE = 2019;
  const VERIFICATION_STANDARD = 0;
  const METADATA_URI = "ipfs://QmExample";
  const PRICE = ethers.parseUnits("100", 6);

  let tokenId: number = 0;

  beforeEach(async function () {
    [verifier, seller, buyer] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy();

    const CarbonCreditFactory = await ethers.getContractFactory("CarbonCredit");
    carbonCredit = await CarbonCreditFactory.deploy(mockUSDC.getAddress());

    await carbonCredit.addVerifier(verifier.getAddress());

    const CarbonMarketplaceFactory = await ethers.getContractFactory(
      "CarbonMarketplace"
    );
    carbonMarketplace = await CarbonMarketplaceFactory.deploy(
      carbonCredit.getAddress(),
      mockUSDC.getAddress()
    );

    const tx = await carbonCredit
      .connect(seller)
      .mintCredit(
        PROJECT_NAME,
        LOCATION,
        TOTAL_SUPPLY,
        VINTAGE,
        VERIFICATION_STANDARD,
        METADATA_URI,
        PRICE
      );
    const receipt = await tx.wait();
    const event = receipt?.logs.find((log: any) => {
      try {
        return carbonCredit.interface.parseLog(log)?.name === "CreditMinted";
      } catch (e) {
        return false;
      }
    });

    if (!event) {
      throw new Error("CreditMinted event not found");
    }
    const parsedEvent = carbonCredit.interface.parseLog(event);
    tokenId = parsedEvent?.args?.tokenId;

    await carbonCredit.connect(verifier).verifyCredit(tokenId);

    await mockUSDC.mint(buyer.getAddress(), ethers.parseUnits("2000", 6));
  });

  describe("Initialization", function () {
    it("Should set the correct carbon credit contract address", async function () {
      expect(await carbonMarketplace.carbonCredit()).to.equal(
        await carbonCredit.getAddress()
      );
    });

    it("Should set the correct USDC token address", async function () {
      expect(await carbonMarketplace.usdcToken()).to.equal(
        await mockUSDC.getAddress()
      );
    });
  });

  describe("Listing Creation", function () {
    it("Should allow creating a listing", async function () {
      const carbonMarketplaceAddress = carbonMarketplace.getAddress();
      const sellerAddress = await seller.getAddress();
      await carbonCredit
        .connect(seller)
        .setApprovalForAll(carbonMarketplaceAddress, true);

      await expect(
        carbonMarketplace
          .connect(seller)
          .createListing(tokenId, QUANTITY, PRICE)
      )
        .to.emit(carbonMarketplace, "Listed")
        .withArgs(1, tokenId, sellerAddress, QUANTITY, PRICE);

      const listing = await carbonMarketplace.listings(1);
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.seller).to.equal(sellerAddress);
      expect(listing.quantity).to.equal(QUANTITY);
      expect(listing.price).to.equal(PRICE);
      expect(listing.active).to.equal(true);

      expect(
        await carbonCredit.balanceOf(carbonMarketplaceAddress, tokenId)
      ).to.equal(QUANTITY);
      expect(await carbonCredit.balanceOf(sellerAddress, tokenId)).to.equal(
        TOTAL_SUPPLY - QUANTITY
      );
    });

    it("Should not allow listing without sufficient balance", async function () {
      await carbonCredit
        .connect(seller)
        .setApprovalForAll(carbonMarketplace.getAddress(), true);

      await expect(
        carbonMarketplace
          .connect(seller)
          .createListing(tokenId, TOTAL_SUPPLY + 1, PRICE)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should not allow listing without approval", async function () {
      await expect(
        carbonMarketplace
          .connect(seller)
          .createListing(tokenId, QUANTITY, PRICE)
      ).to.be.revertedWith("Not approved");
    });
  });

  describe("Purchasing", function () {
    beforeEach(async function () {
      await carbonCredit
        .connect(seller)
        .setApprovalForAll(carbonMarketplace.getAddress(), true);
      await carbonMarketplace
        .connect(seller)
        .createListing(tokenId, QUANTITY, PRICE);
    });

    it("Should allow buying from a listing", async function () {
      const purchaseAmount = 5;
      const totalPrice = PRICE * BigInt(purchaseAmount);

      await mockUSDC
        .connect(buyer)
        .approve(carbonMarketplace.getAddress(), totalPrice);

      await expect(carbonMarketplace.connect(buyer).purchase(1, purchaseAmount))
        .to.emit(carbonMarketplace, "Sold")
        .withArgs(
          1,
          seller.getAddress(),
          buyer.getAddress(),
          purchaseAmount,
          totalPrice
        );

      expect(
        await carbonCredit.balanceOf(buyer.getAddress(), tokenId)
      ).to.equal(purchaseAmount);

      expect(await mockUSDC.balanceOf(seller.getAddress())).to.equal(
        totalPrice
      );

      const listing = await carbonMarketplace.listings(1);
      expect(listing.quantity).to.equal(QUANTITY - purchaseAmount);
      expect(listing.active).to.equal(true);
    });

    it("Should mark listing as inactive when fully purchased", async function () {
      const totalPrice = PRICE * BigInt(QUANTITY);

      await mockUSDC.mint(await buyer.getAddress(), totalPrice);

      await mockUSDC
        .connect(buyer)
        .approve(carbonMarketplace.getAddress(), totalPrice);

      await expect(carbonMarketplace.connect(buyer).purchase(1, QUANTITY))
        .to.emit(carbonMarketplace, "Unlisted")
        .withArgs(1);

      const listing = await carbonMarketplace.listings(1);
      expect(listing.quantity).to.equal(0);
      expect(listing.active).to.equal(false);
    });

    it("Should not allow buying more than available", async function () {
      await mockUSDC
        .connect(buyer)
        .approve(carbonMarketplace.getAddress(), PRICE * BigInt(QUANTITY + 10));

      await expect(
        carbonMarketplace.connect(buyer).purchase(1, QUANTITY + 1)
      ).to.be.revertedWith("Insufficient amount of listings");
    });

    it("Should not allow buying without sufficient allowance", async function () {
      await mockUSDC
        .connect(buyer)
        .approve(carbonMarketplace.getAddress(), PRICE * BigInt(10));

      await expect(
        carbonMarketplace.connect(buyer).purchase(1, 50)
      ).to.be.revertedWith("Insufficient allowance");
    });

    it("Should not allow buying from inactive listings", async function () {
      await carbonMarketplace.connect(seller).cancelListing(1);

      await mockUSDC
        .connect(buyer)
        .approve(carbonMarketplace.getAddress(), PRICE * BigInt(50));

      await expect(
        carbonMarketplace.connect(buyer).purchase(1, 50)
      ).to.be.revertedWith("Listing not active");
    });
  });

  describe("Cancelling Listings", function () {
    beforeEach(async function () {
      await carbonCredit
        .connect(seller)
        .setApprovalForAll(carbonMarketplace.getAddress(), true);
      await carbonMarketplace
        .connect(seller)
        .createListing(tokenId, QUANTITY, PRICE);
    });

    it("Should allow seller to cancel listing", async function () {
      await expect(carbonMarketplace.connect(seller).cancelListing(1))
        .to.emit(carbonMarketplace, "Unlisted")
        .withArgs(1);

      const listing = await carbonMarketplace.listings(1);
      expect(listing.active).to.equal(false);

      expect(
        await carbonCredit.balanceOf(seller.getAddress(), tokenId)
      ).to.equal(TOTAL_SUPPLY);
      expect(
        await carbonCredit.balanceOf(carbonMarketplace.getAddress(), tokenId)
      ).to.equal(0);
    });

    it("Should not allow non-seller to cancel listing", async function () {
      await expect(
        carbonMarketplace.connect(buyer).cancelListing(1)
      ).to.be.revertedWith("Not the seller");
    });

    it("Should not allow cancelling inactive listing", async function () {
      await carbonMarketplace.connect(seller).cancelListing(1);

      await expect(
        carbonMarketplace.connect(seller).cancelListing(1)
      ).to.be.revertedWith("Listing not active");
    });
  });

  describe("Multiple Listings", function () {
    beforeEach(async function () {
      await carbonCredit
        .connect(seller)
        .setApprovalForAll(carbonMarketplace.getAddress(), true);

      await carbonMarketplace.connect(seller).createListing(tokenId, 50, PRICE);

      const tx = await carbonCredit
        .connect(seller)
        .mintCredit(
          "Solar Energy Project",
          "California, USA",
          200,
          2022,
          VERIFICATION_STANDARD,
          "ipfs://QmAnotherExample",
          ethers.parseUnits("15", 6)
        );

      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: any) => {
        try {
          return carbonCredit.interface.parseLog(log)?.name === "CreditMinted";
        } catch (e) {
          return false;
        }
      });

      if (!event) {
        throw new Error("CreditMinted event not found");
      }
      const parsedEvent = carbonCredit.interface.parseLog(event);
      const tokenId2 = parsedEvent?.args?.tokenId;

      await carbonCredit.connect(verifier).verifyCredit(tokenId2);

      await carbonMarketplace
        .connect(seller)
        .createListing(tokenId2, 100, ethers.parseUnits("15", 6));
    });

    it("Should handle multiple listings correctly", async function () {
      const listing1 = await carbonMarketplace.listings(1);
      expect(listing1.tokenId).to.equal(tokenId);
      expect(listing1.quantity).to.equal(50);
      expect(listing1.price).to.equal(PRICE);

      const listing2 = await carbonMarketplace.listings(2);
      expect(listing2.quantity).to.equal(100);
      expect(listing2.price).to.equal(ethers.parseUnits("15", 6));

      await mockUSDC
        .connect(buyer)
        .approve(carbonMarketplace.getAddress(), PRICE * BigInt(20));

      await carbonMarketplace.connect(buyer).purchase(1, 20);

      const updatedListing1 = await carbonMarketplace.listings(1);
      expect(updatedListing1.quantity).to.equal(30);
      expect(updatedListing1.active).to.equal(true);

      const unchangedListing2 = await carbonMarketplace.listings(2);
      expect(unchangedListing2.quantity).to.equal(100);
      expect(unchangedListing2.active).to.equal(true);
    });
  });
});
