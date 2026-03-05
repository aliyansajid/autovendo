import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  pages: {
    signIn: "/login",
  },

  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [process.env.NEXT_PUBLIC_BASE_URL!].filter((url): url is string =>
          Boolean(url),
        )
      : ["http://localhost:3000", "http://localhost:3001"],
});

export type Auth = ReturnType<typeof betterAuth>;
export type Session = Auth["$Infer"]["Session"];
