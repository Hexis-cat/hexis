import z from 'zod';

export const NonceResponseSchema = z.object({
  nonce: z.string(),
});

export const LoginResponseSchema = z.object({
  user: z.object({
    id: z.uuid(),
    walletAddress: z.string(),
    createdAt: z.date(),
  }),
  token: z.string(),
});
