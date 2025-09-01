// import { PrismaAdapter } from "@auth/prisma-adapter";
// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import { db } from "@/lib/db";
// import { compare } from "bcrypt";

// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       email: string;
//       name?: string | null;
//       candidat?: any;
//       recruteur?: any;
//       type: string;
//     };
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     email: string;
//     name?: string | null;
//     candidat?: any;
//     recruteur?: any;
//     type: string;
//   }
// }

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(db),
//   session: {
//     strategy: "jwt",
//   },
//   pages: {
//     signIn: "/login",
//   },
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         url: "https://accounts.google.com/o/oauth2/auth",
//         // params: {
//         //   scope: "https://www.googleapis.com/auth/calendar",
//         //   access_type: "offline",
//         //   response_type: "code",
//         //   prompt: "consent",
//         // },
//       },
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: {
//           label: "Email",
//           type: "email",
//           placeholder: "example@example.com",
//         },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         const user = await db.user.findUnique({
//           where: {
//             email: credentials.email,
//           },
//           include: {
//             candidat: true,
//             recruteur: true,
//           },
//         });

//         if (!user || !user.password) {
//           return null;
//         }

//         const passwordMatch = await compare(
//           credentials.password,
//           user.password
//         );

//         if (!passwordMatch) {
//           return null;
//         }

//         return {
//           id: user.id,
//           email: user.email,
//           name: user.name,
//           candidat: user.candidat,
//           recruteur: user.recruteur,
//           type: user.type,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ token, session }) {
//       if (token) {
//         session.user = {
//           id: token.id,
//           email: token.email,
//           name: token.name,
//           candidat: token.candidat,
//           recruteur: token.recruteur,
//           type: token.type,
//         };
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       const dbUser = await db.user.findFirst({
//         where: {
//           email: token.email!,
//         },
//         include: {
//           candidat: true,
//           recruteur: true,
//         },
//       });

//       if (!dbUser) {
//         if (user) {
//           token.id = user.id;
//         }
//         return token;
//       }

//       return {
//         id: dbUser.id,
//         email: dbUser.email,
//         name: dbUser.name,
//         candidat: dbUser.candidat,
//         recruteur: dbUser.recruteur,
//         type: dbUser.type,
//       };
//     },
//   },
// };

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
  ],
  //   socialProviders: {
  //     google: {
  //       enabled: true,
  //     },
  //   },
});
