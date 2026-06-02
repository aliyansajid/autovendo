import { createAuth } from "@repo/auth";
import { expo } from "@better-auth/expo";

// expo() type is incompatible due to duplicate @better-auth/core installs in the monorepo
export const auth = await createAuth([expo() as any]);
