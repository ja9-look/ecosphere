import { ethers } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { NextResponse } from "next/server";
import { isReadable } from "stream";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

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

    console.log("nftbalanceResponse:", nftBalanceResponse.data);

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

    console.log("filtered carbon credits: ", carbonCredits);

    return NextResponse.json({ carbonCredits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching carbon credits:", error);
    return NextResponse.json(
      { message: "Failed to fetch carbon credits" },
      { status: 500 }
    );
  }
}
