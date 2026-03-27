import { z } from "zod";

type TFn = (key: string) => string;

export const createDealerSearchSchema = (t: TFn) =>
  z.object({
    q: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
  });

export type DealerSearchValues = z.infer<
  ReturnType<typeof createDealerSearchSchema>
>;
// For backward compatibility until we replace all imports
export const dealerSearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});
