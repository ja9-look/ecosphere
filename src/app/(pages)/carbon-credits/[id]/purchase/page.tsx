// import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../lib/auth";

// const client = initiateUserControlledWalletsClient({
//   apiKey: process.env.CIRCLE_API_KEY || "",
// });

// export async function POST(req: Request) {
//     try {
//         const session = await getServerSession(authOptions);
//         if(!session?.user) {
//             return new Response(JSON.stringify({ message: "Unauthorized" }), {
//                 status: 401,
//             });
//         }

//         const { tokenId, amount, metadataURI, recipientAddress, blockchain } = await req.json();
//         if (!tokenId || !amount || !metadataURI || !recipientAddress || !blockchain) {
//             return new Response(JSON.stringify({ message: "Missing required fields" }), {
//                 status: 400,
//             });
//         }
//         const walletResponse = await client.listWallets({
//             userToken: session.user.userToken as string,
//         });

//         const walletId = walletResponse.data?.wallets.find(
//             (wallet) => wallet.blockchain === blockchain
//         )?.id;
//         if (!walletId) {
//             throw new Error(`No wallet found for blockchain: ${blockchain}`);
//         }

//         const walletAddress = walletResponse.data?.wallets.find(
//             (wallet) => wallet.blockchain === blockchain
//         )?.address;

//         const contractAddress = blockchain === "AVAX-FUJI"
//             ? process.env.CARBON_CREDIT_ADDRESS_FUJI
//             : process.env.CARBON_CREDIT_ADDRESS_SEPOLIA;

//             // const purchaseResponse = await client.createUserTransactionContractExecutionChallenge({
//             //     userToken: session.user.userToken as string,
//             //     abiFunctionSignature: "safeTransferFrom(address, address, uint256, uint256, bytes)",
//             //     abiParameters: [
//             //         sellerAddress,
//             //         buyerAddress,
//             //         tokenId,
//             //         amount,
//             //         "0x"
//             //     ],
//             //     contractAddress: contractAddress as string,
//             //     walletId: walletId as string,
//             //     fee: {
//             //         type: "level",
//             //         config: {
//             //             feeLevel: "HIGH"
//             //         }
//             //     }
//     }
