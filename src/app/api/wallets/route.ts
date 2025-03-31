import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import {
  Blockchain,
  initiateUserControlledWalletsClient,
} from "@circle-fin/user-controlled-wallets";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const walletsResponse = await client.listWallets({
      userId: session.user.email as string,
    });

    const wallets = [];

    for (const wallet of walletsResponse.data?.wallets || []) {
      try {
        const { id, address, blockchain } = wallet;

        const balanceResponse = await client.getWalletTokenBalance({
          walletId: id as string,
          userToken: session.user.userToken as string,
        });

        console.log("balanceResponse:", balanceResponse.data);
        const tokenBalance = balanceResponse.data?.tokenBalances?.find(
          (token) =>
            blockchain === "AVAX-FUJI"
              ? token.token.symbol === "AVAX-FUJI"
              : token.token.symbol === "ETH-SEPOLIA"
        )?.amount;

        const usdcTokenBalance = balanceResponse.data?.tokenBalances?.find(
          (token) => token.token.symbol === "USDC"
        )?.amount;

        wallets.push({
          id,
          address,
          blockchain,
          balances: {
            native: {
              amount:
                tokenBalance && Number(tokenBalance) > 0 ? tokenBalance : "0",
              symbol: blockchain,
            },
            usdc: {
              amount:
                usdcTokenBalance && Number(tokenBalance) > 0
                  ? usdcTokenBalance
                  : "0",
              symbol: "USDC",
            },
          },
        });
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
        wallets.push({
          id: wallet.id,
          address: wallet.address,
          blockchain: wallet.blockchain,
          balances: {
            native: {
              amount: "0",
              symbol: wallet.blockchain.includes("AVAX-FUJI") ? "AVAX" : "ETH",
            },
            usdc: {
              amount: "0",
              symbol: "USDC",
            },
          },
        });
      }
    }
    return NextResponse.json({ wallets });
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { message: "Failed to fetch wallets" },
      { status: 500 }
    );
  }
}
