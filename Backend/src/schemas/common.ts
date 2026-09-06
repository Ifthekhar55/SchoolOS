import { z } from 'zod';

export const idParamsSchema = z.object({
  id: z.string().trim().min(1),
}).strict();

export const resetPasswordSchema = z.object({
  password: z.string().min(8).max(128),
}).strict();
