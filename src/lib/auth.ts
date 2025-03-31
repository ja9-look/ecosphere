// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { initiateUserControlledWalletsClient } from "@circle-fin/user-controlled-wallets";
import bcrypt from "bcrypt";
import prisma from "./prisma";

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || "",
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 55 * 60,
  },
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
          const existingUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (existingUser) {
            throw new Error("Email already in use.");
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);

          await client.createUser({
            userId: credentials.email,
          });

          const tokenResponse = await client.createUserToken({
            userId: credentials.email,
          });

          const userToken = tokenResponse.data?.userToken;
          const encryptionKey = tokenResponse.data?.encryptionKey;

          if (!userToken || !encryptionKey) {
            return null;
          }

          const challengeResponse = await client.createUserPinWithWallets({
            userToken,
            blockchains: ["ETH-SEPOLIA"],
          });

          const challengeId = challengeResponse.data?.challengeId;

          const user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              circleUserId: credentials.email,
            },
          });

          return {
            id: user.id,
            userId: user.circleUserId,
            email: user.email,
            userToken,
            encryptionKey,
            challengeId,
          };
        } catch (error: any) {
          console.error("Circle integration error:", error);
          throw new Error(error.message || "An error occurred during sign up");
        }
      },
    }),
    CredentialsProvider({
      id: "SignIn",
      name: "SignIn",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            return null;
          }

          const tokenResponse = await client.createUserToken({
            userId: credentials.email,
          });

          const userResponse = await client.getUser({
            userId: credentials.email,
          });

          const userToken = tokenResponse.data?.userToken;
          const encryptionKey = tokenResponse.data?.encryptionKey;
          const pinStatus = userResponse.data?.user.pinStatus;

          let challengeId: string | undefined;
          if (
            userResponse.data?.user.status !== "ENABLED" &&
            userResponse.data?.user.pinStatus !== "ENABLED"
          ) {
            if (!userToken || !encryptionKey) {
              return null;
            }
          }

          return {
            id: user.id,
            userId: user.circleUserId,
            email: user.email,
            userToken,
            encryptionKey,
            challengeId,
            pinStatus,
          };
        } catch (error: any) {
          console.error("Circle integration error:", error);
          throw new Error(error.message || "An error occurred during sign in");
        }
      },
    }),
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
};

export async function validOnboardStatus(session: any) {
  return !session?.user?.challengeId;
}
