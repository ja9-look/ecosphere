import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { ethers } from "ethers";
import prisma from "../../../../../lib/prisma";
import axios from "axios";
import crypto from "crypto";

const CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS =
  process.env.CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS;
const CARBON_CREDIT_SWAP_CONTRACT_ADDRESS =
  process.env.CARBON_CREDIT_SWAP_CONTRACT_ADDRESS;
const ENTITY_SECRET_CIPHERTEXT = process.env.CIRCLE_ENTITY_CIPHERTEXT;

const CARBON_CREDIT_ABI = [
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
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
    const { action, price, sellerAddress } = await req.json();

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
    const carbonCreditContract = new ethers.Contract(
      CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS as string,
      CARBON_CREDIT_ABI,
      provider
    );

    if (action === "initiateSwap") {
      let sellerAddress;
      try {
        sellerAddress = await carbonCreditContract.ownerOf(id);
      } catch (error) {
        return NextResponse.json(
          { message: "Error fetching seller address" },
          { status: 500 }
        );
      }

      const tokenURI = await carbonCreditContract.tokenURI(id);
      const metadataId = tokenURI.split("/").pop();
      const metadataRecord = await prisma.metadata.findUnique({
        where: { id: metadataId },
      });

      if (!metadataRecord) {
        return NextResponse.json(
          { message: "No metadata found for token" },
          { status: 404 }
        );
      }

      const creditPrice = JSON.parse(metadataRecord.content).price;

      return NextResponse.json({
        tokenId: id,
        price: creditPrice,
        sellerAddress,
      });
    } else if (action === "executeSwap") {
      try {
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
          },
          body: JSON.stringify({
            entitySecretCiphertext: ENTITY_SECRET_CIPHERTEXT,
            contractAddress: CARBON_CREDIT_SWAP_CONTRACT_ADDRESS,
            abiFunctionSignature: "executeSwap(uint256,uint256,address)",
            abiParameters: [id.toString(), price.toString(), sellerAddress],
            idempotencyKey: crypto.randomUUID(),
            walletId: walletId,
          }),
        };

        const response = await fetch(
          `${process.env.CIRCLE_BASE_URL}w3s/user/transactions/contractExecution`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
              "X-User-Token": session.user.userToken as string,
            },
            body: JSON.stringify({
              entitySecretCiphertext: ENTITY_SECRET_CIPHERTEXT,
              contractAddress: CARBON_CREDIT_SWAP_CONTRACT_ADDRESS,
              abiFunctionSignature: "executeSwap(uint256,uint256,address)",
              abiParameters: [id.toString(), price.toString(), sellerAddress],
              idempotencyKey: crypto.randomUUID(),
              walletId: walletId,
              feeLevel: "HIGH",
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          return NextResponse.json(
            {
              message: "Failed to initiate swap",
              error: errorText,
            },
            { status: response.status }
          );
        }

        const responseText = await response.text();

        if (!response.ok) {
          return NextResponse.json(
            {
              message: "Failed to initiate swap",
              error: responseText,
            },
            { status: response.status }
          );
        }

        const responseBody = JSON.parse(responseText);
        return NextResponse.json({
          message: "Swap transaction initiated",
          challengeId: responseBody.data.challengeId,
        });
      } catch (error) {
        return NextResponse.json(
          {
            message: "Failed to execute swap",
            error: error instanceof Error ? error.message : String(error),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
