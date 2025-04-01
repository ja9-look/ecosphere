import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { ethers } from "ethers";
import prisma from "../../../../../lib/prisma";

const CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS =
  process.env.CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS;
const USDC_SEPOLIA_CONTRACT_ADDRESS = process.env.USDC_SEPOLIA_CONTRACT_ADDRESS;
const CARBON_CREDIT_SWAP_CONTRACT_ADDRESS =
  process.env.CARBON_CREDIT_SWAP_CONTRACT_ADDRESS;

const CARBON_CREDIT_ABI = [
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

const CARBON_CREDIT_SWAP_ABI = [
  "function executeSwap(uint256 tokenId, uint256 price, address seller) external",
];

const provider = new ethers.JsonRpcProvider(
  `${process.env.RPC_URL_SEPOLIA}${process.env.ALCHEMY_API_KEY}`
);

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    console.log("purchase route - id: ", id);
    if (!id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { action } = await req.json();
    const wallets = await client.listWallets({
      userToken: session.user.userToken as string,
    });
    const walletId = wallets.data?.wallets.find(
      (wallet) => wallet.blockchain === "ETH-SEPOLIA"
    )?.id;
    if (!walletId) {
      return NextResponse.json(
        { message: "No wallet found for blockchain: SEPOLIA" },
        { status: 400 }
      );
    }

    const balancesResponse = await client.getWalletTokenBalance({
      walletId: walletId as string,
      userToken: session.user.userToken as string,
    });

    const usdcBalance = balancesResponse.data?.tokenBalances?.find(
      (tokenBalance) => tokenBalance.token.symbol === "USDC"
    )?.amount;

    if (!usdcBalance || parseFloat(usdcBalance) < 0) {
      return NextResponse.json(
        { message: "No USDC balance found" },
        { status: 400 }
      );
    }
    const usdcId = balancesResponse.data?.tokenBalances?.find(
      (tokenBalance) => tokenBalance.token.symbol === "USDC"
    )?.token.id;

    const carbonCreditContract = new ethers.Contract(
      CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS as string,
      CARBON_CREDIT_ABI,
      provider
    );

    if (action === "getDetails") {
      const tokenURI = await carbonCreditContract.tokenURI(id);
      const metadataId = tokenURI.split("/").pop();
      const metadataRecord = await prisma.metadata.findUnique({
        where: { id: metadataId },
      });
      if (!metadataRecord) {
        return NextResponse.json(
          { message: "No metadata found for ID: " + metadataId },
          { status: 404 }
        );
      }
      const creditPrice = JSON.parse(metadataRecord.content).price;

      console.log("creditPrice: ", creditPrice);

      let sellerAddress;
      try {
        sellerAddress = await carbonCreditContract.ownerOf(id);
      } catch (error) {
        console.error("Error fetching seller address: ", error);
        return NextResponse.json(
          { message: "Error fetching seller address" },
          { status: 500 }
        );
      }

      const createTxResponse = await client.createTransaction({
        userToken: session.user.userToken as string,
        amounts: [creditPrice.toString()],
        destinationAddress: sellerAddress,
        tokenId: usdcId as string,
        walletId: walletId as string,
        fee: {
          type: "level",
          config: {
            feeLevel: "HIGH",
          },
        },
      });

      return NextResponse.json(
        {
          message: "Transaction created successfully - challenge id returned",
          challengeId: createTxResponse.data?.challengeId,
        },
        { status: 200 }
      );
    } else if (action === "executeSwap") {
      //   const swapContract = new ethers.Contract(
      //     CARBON_CREDIT_SWAP_CONTRACT_ADDRESS as string,
      //     CARBON_CREDIT_SWAP_ABI,
      //     provider
      //   );
      //   const approveContract = new ethers.Contract(
      //     USDC_SEPOLIA_CONTRACT_ADDRESS as string,
      //     USDC_ABI,
      //     provider
      //   );
      //   const approveTx = await approveContract.approve(
      //     CARBON_CREDIT_SWAP_CONTRACT_ADDRESS,
      //     price
      //   );
      //   await approveTx.wait();
      //   const executeSwapTx = await swapContract.executeSwap(id, price, walletId);
      //   await executeSwapTx.wait();
      console.log("executeSwap action happening");
      return NextResponse.json(
        {
          message: "Execute Swap placeholder",
          // transactionHash: executeSwapTx.hash,
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error in purchase route: ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
