import { createAuth } from "@repo/auth";
import { expo } from "@better-auth/expo";

export const auth = createAuth([expo()]);
