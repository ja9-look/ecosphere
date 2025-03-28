import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import {
  Blockchain,
  initiateUserControlledWalletsClient,
} from "@circle-fin/user-controlled-wallets";
import { ethers } from "ethers";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

const getProvider = (blockchain: Blockchain) => {
  switch (blockchain) {
    case "AVAX-FUJI":
      return new ethers.JsonRpcProvider(process.env.RPC_URL_FUJI);
    case "ETH-SEPOLIA":
      return new ethers.JsonRpcProvider(
        `${process.env.RPC_URL_SEPOLIA}${process.env.INFURA_API_KEY}`
      );
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`);
  }
};

const getUsdcAddress = (blockchain: Blockchain) => {
  switch (blockchain) {
    case "AVAX-FUJI":
      return process.env.USDC_ADDRESS_FUJI;
    case "ETH-SEPOLIA":
      return process.env.USDC_ADDRESS_SEPOLIA;
    default:
      throw new Error(`Unsupported blockchain: ${blockchain}`);
  }
};

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

        const provider = getProvider(blockchain);
        const usdcAddress = getUsdcAddress(blockchain);

        const balance = await provider.getBalance(address);
        if (!usdcAddress) {
          throw new Error(
            `USDC address is undefined for blockchain: ${blockchain}`
          );
        }
        const usdcBalance = await provider.getBalance(usdcAddress);

        wallets.push({
          id,
          address,
          blockchain,
          balances: {
            native: {
              amount: ethers.formatEther(balance),
              symbol: wallet.blockchain.includes("AVAX-FUJI") ? "AVAX" : "ETH",
            },
            usdc: {
              amount: ethers.formatEther(usdcBalance),
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
