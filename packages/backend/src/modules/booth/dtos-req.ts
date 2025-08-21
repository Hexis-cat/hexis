import z from 'zod';

export const GetBoothPaginationDtoValidationScheme = z.object({
  page: z.coerce
    .number()
    .min(1)
    .default(1)
    .transform(val => Number(val)),
  size: z.coerce
    .number()
    .min(1)
    .default(10)
    .transform(val => Number(val)),
});

export type GetBoothPaginationDTO = z.infer<
  typeof GetBoothPaginationDtoValidationScheme
>;

export const GetBoothDtoValidationScheme = z.object({
  boothId: z.string().regex(/^0x[a-f0-9]+$/, {
    message: 'boothId should be a string of hex characters',
  }),
});

export type GetBoothDTO = z.infer<typeof GetBoothDtoValidationScheme>;

export const CreateBoothDtoValidationScheme = z.object({
  id: z.string().regex(/^0x[a-f0-9]+$/, {
    message: 'id should be a string of hex characters',
  }),

  fullText: z.string(),
});

export type CreateBoothDTO = z.infer<typeof CreateBoothDtoValidationScheme>;

export const PatchBoothParamDtoValidationScheme = z.object({
  boothId: z.string().regex(/^0x[a-f0-9]+$/, {
    message: 'boothId should be a string of hex characters',
  }),
});

export type PatchBoothParamDTO = z.infer<
  typeof PatchBoothParamDtoValidationScheme
>;

export const PatchBoothDtoValidationScheme = z.object({
  boothId: z.string().regex(/^0x[a-f0-9]+$/, {
    message: 'boothId should be a string of hex characters',
  }),
  previewText: z.string(),
});

export type PatchBoothDTO = z.infer<typeof PatchBoothDtoValidationScheme>;
