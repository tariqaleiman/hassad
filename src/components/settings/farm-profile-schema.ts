import { z } from "zod";

export const farmProfileSchema = z.object({
  farmName: z.string().optional(),
  farmLocation: z.string().optional(),
});

export type FarmProfileSchema = z.infer<typeof farmProfileSchema>;
