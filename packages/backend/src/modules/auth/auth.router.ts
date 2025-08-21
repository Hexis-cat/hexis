import { trpcServer } from '@hono/trpc-server';
import { onError, publicProcedure, router } from '@lib/trpc/trpc';
import { AuthService } from './auth.service';
import { LoginDtoValidationScheme, NonceDtoValidationScheme } from './dtos-req';
import { LoginResponseSchema, NonceResponseSchema } from './dtos-res';

const AuthTrpcRouter = router({
  nonce: publicProcedure
    .input(NonceDtoValidationScheme)
    .output(NonceResponseSchema)
    .query(async ({ input }) => {
      const { address } = input;
      const nonce = await AuthService.generateNonce(address.toLowerCase());
      return nonce;
    }),
  login: publicProcedure
    .input(LoginDtoValidationScheme)
    .output(LoginResponseSchema)
    .mutation(async ({ input }) => {
      const { nonce, signature, address } = input;
      const response = await AuthService.login({
        nonce,
        signature,
        address: address.toLowerCase(),
      });

      return response;
    }),
});

export const AuthTrpcServer = trpcServer({
  router: AuthTrpcRouter,
  onError: onError,
});
