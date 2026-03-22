import { z } from "zod";

export const dealerSearchSchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
});

export type DealerSearchValues = z.infer<typeof dealerSearchSchema>;
