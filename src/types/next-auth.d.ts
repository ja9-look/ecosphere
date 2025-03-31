import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    userId?: string;
    userToken?: string;
    encryptionKey?: string;
    challengeId?: string;
    pinStatus?: string;
  }

  interface Session {
    user: User & {
      id: string;
      userToken?: string;
      encryptionKey?: string;
      challengeId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userToken?: string;
    encryptionKey?: string;
    challengeId?: string;
  }
}
