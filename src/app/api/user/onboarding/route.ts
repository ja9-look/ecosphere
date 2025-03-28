import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const walletsResponse = await client.listWallets({
      userId: session.user.email as string,
    });

    const walletIds =
      walletsResponse.data?.wallets?.map((wallet) => wallet.id) || [];

    await prisma.user.update({
      where: { email: session.user.email as string },
      data: {
        isOnboarded: true,
        walletIds: JSON.stringify(walletIds),
      },
    });

    return NextResponse.json({
      success: true,
      walletIds,
      isOnboarded: true,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { message: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
