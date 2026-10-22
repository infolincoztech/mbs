import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      marqueeId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    marqueeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    marqueeId?: string | null;
    id: string;
  }
}
