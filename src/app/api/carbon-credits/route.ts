import { ethers } from "ethers";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import { NextResponse } from "next/server";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

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

    const carbonCredits =
      nftBalanceResponse.data?.nfts?.map(async (nft) => {
        let metadata = {};
        try {
          if (
            typeof nft.metadata === "string" &&
            nft.metadata.startsWith("http")
          ) {
            const response = await fetch(nft.metadata);
            if (!response.ok) {
              throw new Error("Failed to fetch metadata");
            }
            metadata = await response.json();
          }
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }

        console.log("my carbon credits:", nftBalanceResponse.data?.nfts);
        return {
          tokenId: nft.nftTokenId,
          amount: nft.amount,
          metadata: {
            ...metadata,
          },
        };
      }) || [];
    return NextResponse.json({ carbonCredits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching carbon credits:", error);
    return NextResponse.json(
      { message: "Failed to fetch carbon credits" },
      { status: 500 }
    );
  }
}
