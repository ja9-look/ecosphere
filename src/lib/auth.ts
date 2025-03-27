import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "SignUp",
      name: "SignUp",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await client.createUser({
            userId: credentials.email,
          });

          const tokenResponse = await client.createUserToken({
            userId: credentials.email,
          });

          const userToken = tokenResponse.data?.userToken;
          const encryptionKey = tokenResponse.data?.encryptionKey;

          console.log("userToken: ", userToken);
          console.log("encryptionKey: ", encryptionKey);

          if (!userToken || !encryptionKey) {
            return null;
          }

          const challengeResponse = await client.createUserPinWithWallets({
            userToken,
            blockchains: ["AVAX-FUJI"],
          });

          const challengeId = challengeResponse.data?.challengeId;

          console.log("challengeId: ", challengeId);
          // Return user object
          return {
            id: credentials.email,
            userId: credentials.email,
            email: credentials.email,
            userToken,
            encryptionKey,
            challengeId,
          };
        } catch (error: any) {
          console.error("Circle integration error:", error);
          if (error.response) {
            console.error(
              "Error details:",
              JSON.stringify(error.response.data, null, 2)
            );
          }
          return null;
        }
      },
    }),
    // Add sign in provider here (similar to sign up)
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userToken = user.userToken;
        token.encryptionKey = user.encryptionKey;
        token.challengeId = user.challengeId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.userToken = token.userToken as string;
        session.user.encryptionKey = token.encryptionKey as string;
        session.user.challengeId = token.challengeId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
};

export async function validOnboardStatus(session: any) {
  return !session?.user?.challengeId;
}
