// import { getServerSession } from "next-auth";
// import { authOptions } from "../../../../../lib/auth";
// import { NextResponse } from "next/server";
// import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

// const carbonCreditAddress = process.env.CARBON_CREDIT_CIRCLE_CONTRACT_ADDRESS;
// const usdcSepoliaAddress = process.env.USDC_SEPOLIA_CONTRACT_ADDRESS;
// const circleBaseUrl = process.env.CIRCLE_BASE_URL;
// const circleApiKey = process.env.CIRCLE_API_KEY
// const USDC_ABI = [
//   "function approve(address spender, uint256 amount) external returns (bool)",
//   "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
//   "function balanceOf(address account) external view returns (uint256)",
//   "function allowance(address owner, address spender) external view returns (uint256)",
// ];

// const CARBON_CREDIT_ABI = [
//   "function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external",
//   "function balanceOf(address account, uint256 id) external view returns (uint256)",
//   "function isApprovedForAll(address account, address operator) external view returns (bool)",
//   "function setApprovalForAll(address operator, bool approved) external",
// ];

// const client = initiateUserControlledWalletsClient({
//     apiKey: process.env.CIRCLE_API_KEY || "",
// })

// interface PurchaseRequest {
//   params: {
//     tokenId: string;
//   };
// }

// export async function POST(req: Request, { params }: PurchaseRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { tokenId } = params;
//     if (!tokenId) {
//       return new Response(JSON.stringify({ message: "Missing required fields" }), {
//         status: 400,
//       });
//     }

//     if(!session.user.userToken || !session.user.encryptionKey){
//         return NextResponse.json({ message: "Missing user token or encryption key" }, { status: 400 });
//     }

//     const {action} = await req.json();

//     const walletResponse = await client.listWallets({
//         userToken: session.user.userToken as string,
//     })
//     if(!walletResponse.data?.wallets){
//         return NextResponse.json({ message: "No wallets found" }, { status: 400 });
//     }
//     const walletId = walletResponse.data?.wallets.find(
//         (wallet) => wallet.blockchain === "ETH-SEPOLIA"
//     )?.id;
//     if (!walletId) {
//         throw new Error(`No wallet found for blockchain: ETH-SEPOLIA`);
//     }
//     const walletBalance = await client.getWalletTokenBalance({
//         walletId: walletId as string,
//         userToken: session.user.userToken as string,
//     })

//     if(!walletBalance.data?.tokenBalances){
//         return NextResponse.json({ message: "No token balances found" }, { status: 400 });
//     }
//     const usdcBalance = walletBalance.data?.tokenBalances.find(
//         (balance) => balance.token.symbol === "USDC"
//     )?.amount;

//     if (!usdcBalance) {
//         throw new Error(`No USDC balance found`);
//     }
//     const usdcBalanceNumber = parseFloat(usdcBalance);
//     if (usdcBalanceNumber <= 0) {
//         return NextResponse.json({ message: "Insufficient USDC balance" }, { status: 400 });
//     }

//     if (action === "approve") {
//         const createTxResponse = await fetch(`${circleBaseUrl}/transactions`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             "Authorization": `Bearer ${circleApiKey}`,
//             `X-User-Token`: session.user.userToken as string,
//             },
//         )
