import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

async function main() {
  console.log("Deploying Carbon Credit Marketplace contracts...");

  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`Deploying contracts with account: ${deployerAddress}`);

  const network = process.env.HARDHAT_NETWORK || "localhost";
  console.log(`Deploying to network: ${network}`);

  const defaultTokenAddresses: { [key: string]: string } = {
    localhost: "",
    baseSepolia: process.env.USDC_ADDRESS_BASE_SEPOLIA || "",
    fuji: process.env.USDC_ADDRESS_FUJI || "",
  };

  let usdcAddress = defaultTokenAddresses[network];

  let finalUsdcAddress: string;

  if (network === "localhost" && !usdcAddress) {
    console.log("Deploying MockUSDC for local development...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDCFactory = MockUSDC.connect(deployer);
    const mockUSDC = await mockUSDCFactory.deploy();
    finalUsdcAddress = await mockUSDC.getAddress();
    console.log(`MockUSDC deployed to: ${finalUsdcAddress}`);
  } else {
    if (!usdcAddress) {
      throw new Error(`No USDC address configured for network: ${network}`);
    }
    finalUsdcAddress = usdcAddress;
    console.log(`Using existing USDC at: ${finalUsdcAddress}`);
  }

  console.log("Deploying CarbonCredit...");
  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  const carbonCreditFactory = CarbonCredit.connect(deployer);
  const carbonCredit = await carbonCreditFactory.deploy(finalUsdcAddress);
  const carbonCreditAddress = await carbonCredit.getAddress();
  console.log(`CarbonCredit deployed to: ${carbonCreditAddress}`);

  console.log("Deploying CarbonMarketplace...");
  const CarbonMarketplace = await ethers.getContractFactory(
    "CarbonMarketplace"
  );
  const carbonMarketplaceFactory = CarbonMarketplace.connect(deployer);
  const carbonMarketplace = await carbonMarketplaceFactory.deploy(
    carbonCreditAddress,
    finalUsdcAddress
  );
  const carbonMarketplaceAddress = await carbonMarketplace.getAddress();
  console.log(`CarbonMarketplace deployed to: ${carbonMarketplaceAddress}`);

  const contractAddresses = {
    usdc: finalUsdcAddress,
    carbonCredit: carbonCreditAddress,
    carbonMarketplace: carbonMarketplaceAddress,
  };

  const outputDir = path.join(__dirname, "..", "src", "lib", "blockchain");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, `contract-addresses-${network}.json`),
    JSON.stringify(contractAddresses, null, 2)
  );
  console.log(
    `Contract addresses saved to src/lib/blockchain/contract-addresses-${network}.json`
  );

  const abiDir = path.join(outputDir, "abis");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  if (network === "localhost") {
    const mockUSDCAbi =
      require("../artifacts/contracts/MockUSDC.sol/MockUSDC.json").abi;
    fs.writeFileSync(
      path.join(abiDir, "MockUSDC.json"),
      JSON.stringify(mockUSDCAbi, null, 2)
    );
  }

  const carbonCreditAbi =
    require("../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json").abi;
  const carbonMarketplaceAbi =
    require("../artifacts/contracts/CarbonMarketplace.sol/CarbonMarketplace.json").abi;

  fs.writeFileSync(
    path.join(abiDir, "CarbonCredit.json"),
    JSON.stringify(carbonCreditAbi, null, 2)
  );

  fs.writeFileSync(
    path.join(abiDir, "CarbonMarketplace.json"),
    JSON.stringify(carbonMarketplaceAbi, null, 2)
  );

  console.log(`ABIs exported to src/lib/blockchain/abis/`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
