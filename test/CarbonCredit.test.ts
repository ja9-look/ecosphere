import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CarbonCredit, MockUSDC } from "../typechain-types";

describe("Carbon Credit", function () {
  let mockUSDC: MockUSDC;
  let carbonCredit: CarbonCredit;
  let owner: Signer;
  let verifier: Signer;
  let seller: Signer;
  let buyer: Signer;

  const PROJECT_NAME = "Cabo Leones Wind Farm";
  const LOCATION = "Chile";
  const TOTAL_SUPPLY = 5000;
  const VINTAGE = 2019;
  const VERIFICATION_STANDARD = 0;
  const METADATA_URI = "ipfs://QmExample";
  const PRICE = ethers.parseUnits("100", 6);

  beforeEach(async function () {
    [owner, verifier, seller, buyer] = await ethers.getSigners();

    const MockUSDCFactory = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDCFactory.deploy();

    const CarbonCreditFactory = await ethers.getContractFactory("CarbonCredit");
    carbonCredit = await CarbonCreditFactory.deploy(mockUSDC.getAddress());

    await carbonCredit.addVerifier(verifier.getAddress());
  });

  describe("Initialization", function () {
    it("Should set the correct USDC address", async function () {
      expect(await carbonCredit.usdcToken()).to.equal(
        await mockUSDC.getAddress()
      );
    });

    it("Should set deployer as initial verifier", async function () {
      expect(await carbonCredit.verifiers(await owner.getAddress())).to.equal(
        true
      );
    });

    it("Should set the correct verifier", async function () {
      expect(
        await carbonCredit.verifiers(await verifier.getAddress())
      ).to.equal(true);
    });
  });

  describe("Credit Creation", function () {
    it("Should allow the creation of a carbon credit", async function () {
      await mockUSDC.connect(seller).approve(carbonCredit.getAddress(), PRICE);
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
      const event = receipt?.logs.find((log) => {
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
      const tokenId = parsedEvent?.args?.tokenId;

      const carbonCreditData = await carbonCredit.credits(tokenId);

      expect(carbonCreditData.projectName).to.equal(PROJECT_NAME);
      expect(carbonCreditData.location).to.equal(LOCATION);
      expect(carbonCreditData.totalSupply).to.equal(TOTAL_SUPPLY);
      expect(carbonCreditData.vintage).to.equal(VINTAGE);
      expect(carbonCreditData.verificationStandard).to.equal(
        VERIFICATION_STANDARD
      );
      expect(carbonCreditData.metadataURI).to.equal(METADATA_URI);
      expect(carbonCreditData.isVerified).to.equal(false);
      expect(carbonCreditData.price).to.equal(PRICE);

      expect(
        await carbonCredit.balanceOf(await seller.getAddress(), tokenId)
      ).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("Credit Verification", function () {
    it("Should allow the verification of a carbon credit", async function () {
      await mockUSDC.connect(seller).approve(carbonCredit.getAddress(), PRICE);
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
      const tokenId = parsedEvent?.args?.tokenId;

      await carbonCredit.connect(verifier).verifyCredit(tokenId);

      const carbonCreditData = await carbonCredit.credits(tokenId);

      expect(carbonCreditData.isVerified).to.equal(true);
    });
  });
});
