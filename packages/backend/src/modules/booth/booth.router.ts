import { trpcServer } from '@hono/trpc-server';
import { BoothService } from './booth.service';
import {
  CreateBoothDtoValidationScheme,
  GetBoothDtoValidationScheme,
  GetBoothPaginationDtoValidationScheme,
  PatchBoothDtoValidationScheme,
  PatchBoothParamDtoValidationScheme,
} from './dtos-req';

import {
  createJwtContext,
  onError,
  protectedProcedure,
  publicProcedure,
  router,
} from '@lib/trpc/trpc';
import { BoothSchema, GetBoothsResponseSchema } from './dto-res';

const BoothTrpcRouter = router({
  getBooths: publicProcedure
    .input(GetBoothPaginationDtoValidationScheme)
    .output(GetBoothsResponseSchema)
    .query(async ({ input }) => {
      const { page, size } = input;
      const { count, list } = await BoothService.getBooths(page, size);
      return { count, list };
    }),
  getBooth: protectedProcedure
    .input(GetBoothDtoValidationScheme)
    .output(BoothSchema)
    .query(async ({ input, ctx }) => {
      const { boothId } = input;
      const booth = await BoothService.getBooth(boothId);
      return booth;
    }),
  createBooth: protectedProcedure
    .input(CreateBoothDtoValidationScheme)
    .output(BoothSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { id, fullText } = input;
      const booth = await BoothService.createBooth({
        id,
        requestOwnerAddress: user.address,
        fullText,
      });

      return BoothSchema.parse(booth);
    }),
  patchBooth: protectedProcedure
    .input(PatchBoothDtoValidationScheme)
    .output(BoothSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { boothId, previewText } = input;
      const updatedBooth = await BoothService.patchBooth({
        boothId,
        previewText,
        ownerAddress: user.address,
      });
      return BoothSchema.parse(updatedBooth);
    }),
  boothStartSale: protectedProcedure
    .input(PatchBoothParamDtoValidationScheme)
    .output(BoothSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { boothId } = input;
      const updatedBooth = await BoothService.boothStartSale({
        boothId,
        ownerAddress: user.address,
      });
      return BoothSchema.parse(updatedBooth);
    }),
  boothEndSale: protectedProcedure
    .input(PatchBoothParamDtoValidationScheme)
    .output(BoothSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx;
      const { boothId } = input;
      const updatedBooth = await BoothService.boothEndSale({
        boothId,
        ownerAddress: user.address,
      });
      return BoothSchema.parse(updatedBooth);
    }),
});

export const BoothTrpcServer = trpcServer({
  router: BoothTrpcRouter,
  createContext: createJwtContext,
  onError: onError,
});
