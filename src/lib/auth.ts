import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            ownedMarquee: true,
          },
        }).catch(async (err) => {
          console.error("Auth: Prisma include failed", err.message);
          return await prisma.user.findUnique({
            where: { email: credentials.email },
          });
        });

        if (!user || !user.password) {
          throw new Error("User not found");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Invalid password");
        }

        const ownedMarquee = (user as any).ownedMarquee;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone || null,
          marqueeId: ownedMarquee?.id || null,
          marqueeName: ownedMarquee?.name || null,
          primaryColor: ownedMarquee?.primaryColor || "#2563eb",
          logo: ownedMarquee?.logo || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.phone = (user as any).phone;
        token.marqueeId = (user as any).marqueeId;
        token.marqueeName = (user as any).marqueeName;
        token.primaryColor = (user as any).primaryColor;
        token.logo = (user as any).logo;
      }
      // If we use update() it can pass data through trigger
      if (arguments[0].trigger === "update" && arguments[0].session) {
        token = { ...token, ...arguments[0].session };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).marqueeId = token.marqueeId;
        (session.user as any).marqueeName = token.marqueeName;
        (session.user as any).primaryColor = token.primaryColor;
        (session.user as any).logo = token.logo;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
