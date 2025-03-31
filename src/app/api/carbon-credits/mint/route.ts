import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { ethers, uuidV4 } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

const developerSdk = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || "",
});

const carbonCreditContractAddress =
  process.env.CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user.email !== "mintadmin@carboncredit.com") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const {
      projectName,
      location,
      amount,
      vintage,
      verificationStandard,
      metadataURI,
      price,
    } = await req.json();

    if (
      !projectName ||
      !location ||
      !amount ||
      !vintage ||
      !verificationStandard ||
      !metadataURI ||
      !price
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const walletResponse = await client.listWallets({
      userToken: session.user.userToken as string,
    });
    const walletId = walletResponse.data?.wallets.find(
      (wallet) => wallet.blockchain === "ETH-SEPOLIA"
    )?.id;
    if (!walletId) {
      throw new Error(`No wallet found for blockchain: ETH-SEPOLIA`);
    }
    const walletAddress = walletResponse.data?.wallets.find(
      (wallet) => wallet.blockchain === "ETH-SEPOLIA"
    )?.address;

    const tokenId = Math.floor(Date.now() / 1000);
    // console.log("userToken:", session.user.userToken);
    // console.log("Wallet Address:", walletAddress);
    // console.log("Metadata URI:", metadataURI);
    // console.log("Contract Address:", carbonCreditContractAddress);
    // console.log("wallet ID:", walletId);
    // console.log("amount: ", amount);
    // console.log("sesion token: ", session.user.userToken);

    const mintResponse = await developerSdk.createContractExecutionTransaction({
      walletId: process.env.ECOSPHERE_WALLET_ID as string,
      abiFunctionSignature: "mintTo(address,string)",
      abiParameters: [walletAddress, metadataURI],
      contractAddress: carbonCreditContractAddress as string,
      fee: {
        type: "level",
        config: {
          feeLevel: "HIGH",
        },
      },
    });

    if (!mintResponse.data) {
      console.error("Failed to create transaction:", mintResponse);
      return NextResponse.json(
        { message: "Failed to create transaction" },
        { status: 500 }
      );
    }

    const transactionId = mintResponse.data.id;
    const state = mintResponse.data.state;

    console.log("Transaction ID:", transactionId);
    console.log("Transaction Status:", state);

    const carbonCredit = {
      tokenId,
      projectName,
      location,
      amount,
      vintage,
      verificationStandard,
      metadataURI,
      price: price.toString(),
      ownerAddress: walletAddress,
      isListed: true,
      status: "pending",
    };

    console.log("carbonCredit:", carbonCredit);
    return NextResponse.json(
      { transactionId, state, carbonCredit },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error minting carbon credits:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
