import { BoothPaymentOptionEnum, BoothSaleTypeEnum } from '@db/schema';
import { z } from 'zod';

export const BoothSchema = z.object({
  id: z.string().max(100),
  owner: z.string().max(42),
  price: z.string().max(1000),
  previewText: z.string(),

  boothAddress: z.string().max(42),

  paymentOption: z.enum(BoothPaymentOptionEnum.enumValues),
  paymentTokenAddress: z.string().max(42),

  saleType: z.enum(BoothSaleTypeEnum.enumValues),
  isSaleStarted: z.boolean(),

  blockNumber: z.string().max(100),
  createdAt: z.date(),
});

export const GetBoothsResponseSchema = z.object({
  count: z.number().int().min(0),
  list: z.array(BoothSchema),
});
