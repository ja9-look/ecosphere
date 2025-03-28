import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      userToken?: string;
      encryptionKey?: string;
      challengeId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    userToken?: string;
    encryptionKey?: string;
    challengeId?: string;
  }
}
