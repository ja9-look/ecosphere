import { ethers } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { NextResponse } from "next/server";
import { isReadable } from "stream";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

const CARBON_CREDIT_SWAP_CONTRACT_ADDRESS =
  process.env.CARBON_CREDIT_SWAP_CONTRACT_ADDRESS;
const CIRCLE_ENTITY_CIPHERTEXT = process.env.CIRCLE_ENTITY_CIPHERTEXT;

const fetchMetadata = async (url: string) => {
  try {
    const metadataResponse = await fetch(url);
    if (!metadataResponse.ok) {
      return null;
    }
    return await metadataResponse.json();
  } catch (error) {
    return null;
  }
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
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

    const nftBalanceResponse = await client.getWalletNFTBalance({
      walletId: walletId as string,
      userToken: session.user.userToken as string,
    });

    const nfts = nftBalanceResponse.data?.nfts || [];
    if (nfts.length === 0) {
      return NextResponse.json({ message: "No NFTs found" }, { status: 404 });
    }

    const carbonCreditsPromises = nfts.map(async (nft) => {
      if (
        !nft.metadata ||
        !nft.metadata.startsWith("http") ||
        nft.metadata.length !== 71
      ) {
        return null;
      }

      if (!nft.nftTokenId) {
        return null;
      }

      const metadata = await fetchMetadata(nft.metadata);

      return {
        tokenId: nft.nftTokenId,
        amount: nft.amount,
        metadata: {
          ...metadata.metadata,
        },
        originalMetadataUrl: nft.metadata,
      };
    });

    const allResults = await Promise.all(carbonCreditsPromises);
    const carbonCredits = allResults.filter((credit) => credit !== null);

    return NextResponse.json({ carbonCredits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching carbon credits:", error);
    return NextResponse.json(
      { message: "Failed to fetch carbon credits" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.email !== "admin@carboncredit.com") {
      {
        return NextResponse.json(
          {
            message:
              "Unauthorized - only admin users are allowed to approve carbon credits",
          },
          { status: 401 }
        );
      }
    }

    const { tokenId, action } = await req.json();
    if (!tokenId) {
      return NextResponse.json(
        { message: "Token ID is required" },
        { status: 400 }
      );
    }

    if (action !== "approve") {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    const walletResponse = await client.listWallets({
      userToken: session.user.userToken as string,
    });

    const walletId = walletResponse.data?.wallets.find(
      (wallet) => wallet.blockchain === "ETH-SEPOLIA"
    )?.id;

    if (!walletId) {
      return NextResponse.json(
        { message: "No wallet found for blockchain: ETH-SEPOLIA" },
        { status: 400 }
      );
    }

    try {
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
            entitySecretCiphertext: CIRCLE_ENTITY_CIPHERTEXT,
            contractAddress: CARBON_CREDIT_SWAP_CONTRACT_ADDRESS,
            abiFunctionSignature: "approve(address,uint256)",
            abiParameters: [
              CARBON_CREDIT_SWAP_CONTRACT_ADDRESS,
              tokenId.toString(),
            ],
            idempotencyKey: crypto.randomUUID(),
            walletId: walletId,
            feeLevel: "HIGH",
          }),
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Approval initiation error:", errorText);
        throw new Error(`Failed to initiate approval: ${errorText}`);
      }

      const responseText = await response.text();
      const responseBody = JSON.parse(responseText);

      return NextResponse.json({
        message: "Approval transaction initiated",
        challengeId: responseBody.data.challengeId,
      });
    } catch (error) {
      return NextResponse.json(
        {
          message: "Failed to initiate approval",
          error: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
