import NextAuth from "next-auth";

declare module "next-auth" {
  export interface User {
    userId: string;
    userToken: string;
    encryptionKey: string;
    challengeId?: string;
  }

  export interface Session {
    user: User;
  }
}
