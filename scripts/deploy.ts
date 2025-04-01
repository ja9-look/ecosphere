import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

async function main() {
  console.log("Deploying Carbon Credit Swap contract...");
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  console.log(`Deploying contracts with account: ${deployerAddress}`);

  const network = process.env.HARDHAT_NETWORK || "localhost";
  console.log(`Deploying to network: ${network}`);

  const defaultTokenAddresses: { [key: string]: string } = {
    localhost: "",
    sepolia: process.env.USDC_SEPOLIA_CONTRACT_ADDRESS || "",
  };

  let carbonCreditAddress =
    process.env.CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS || "";
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
    if (!carbonCreditAddress) {
      throw new Error("No carbon credit contract address provided");
    }
    console.log(
      `Using existing Carbon Credit Circle contract at: ${carbonCreditAddress}`
    );
  }

  console.log("Deploying Carbon Credit Swap...");
  const CarbonCreditSwap = await ethers.getContractFactory("CarbonCreditSwap");
  const carbonCreditSwapFactory = CarbonCreditSwap.connect(deployer);
  const carbonCreditSwap = await carbonCreditSwapFactory.deploy(
    carbonCreditAddress,
    finalUsdcAddress
  );
  const carbonCreditSwapAddress = await carbonCreditSwap.getAddress();
  console.log(`Carbon Credit Swap deployed to: ${carbonCreditSwapAddress}`);

  const contractAddresses = {
    carbonCreditNFT: carbonCreditAddress,
    usdc: finalUsdcAddress,
    atomicSwap: carbonCreditSwapAddress,
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

  const carbonCreditSwapAbi =
    require("../artifacts/contracts/CarbonCreditSwap.sol/CarbonCreditSwap.json").abi;

  fs.writeFileSync(
    path.join(abiDir, "CarbonCreditSwap.json"),
    JSON.stringify(carbonCreditSwapAbi, null, 2)
  );

  console.log(`ABI exported to src/lib/blockchain/abis/`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
