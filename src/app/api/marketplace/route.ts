import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../lib/auth";
import { ethers } from "ethers";
import prisma from "../../../lib/prisma";

const carbonCreditContractAddress =
  process.env.CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS;

const carbonCreditABI = [
  "function totalSupply() external view returns (uint256)",
  "function tokenByIndex(uint256 index) external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
];

interface TokenMetadata {
  projectName: string;
  location: string;
  amount: number;
  vintage: number;
  verificationStandard: string;
  price: number;
  isVerified: boolean;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const provider = new ethers.JsonRpcProvider(
      `${process.env.RPC_URL_SEPOLIA}${process.env.ALCHEMY_API_KEY}`
    );

    const carbonCreditContract = new ethers.Contract(
      carbonCreditContractAddress as string,
      carbonCreditABI,
      provider
    );

    const totalSupply = await carbonCreditContract.totalSupply();

    const carbonCredits = [];

    for (let i = 0; i < parseInt(totalSupply); i++) {
      const tokenId = await carbonCreditContract.tokenByIndex(i);

      const tokenURI = await carbonCreditContract.tokenURI(tokenId);

      const metadataId = tokenURI.split("/").pop();

      if (!metadataId) {
        console.error(`Could not extract metadata ID from URI: ${tokenURI}`);
        continue;
      }

      const metadataRecord = await prisma.metadata.findUnique({
        where: { id: metadataId },
      });
      //   console.log("metadataRecord: ", metadataRecord);

      if (!metadataRecord) {
        console.error(`No metadata found for ID: ${metadataId}`);
        return;
      }

      const owner = await carbonCreditContract.ownerOf(tokenId);

      const metadata = JSON.parse(metadataRecord.content);
      carbonCredits.push({
        tokenId: tokenId.toString(),
        metadata: {
          projectName: metadata.projectName,
          location: metadata.location,
          amount: metadata.amount,
          vintage: metadata.vintage,
          verificationStandard: metadata.verificationStandard,
          price: metadata.price,
          isVerified: metadata.isVerified,
        },
        originalMetadataUrl: `${process.env.NEXTAUTH_URL}/api/metadata/${metadataId}`,
        owner,
      });
    }
    console.log("carbonCredits: ", carbonCredits);
    return NextResponse.json({ carbonCredits }, { status: 200 });
  } catch (error) {
    console.error("Error fetching carbon credits:", error);
    return NextResponse.json(
      { message: "Failed to fetch carbon credits" },
      { status: 500 }
    );
  }
}
