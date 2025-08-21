import { JwtPayload } from '@commons/types';
import { validateJWT } from '@commons/utils/validateJWT';
import { TRPCError, initTRPC } from '@trpc/server';
import { Context } from 'hono';

export type TrpcContext = Context & {
  user: JwtPayload | null;
};

export const trpc = initTRPC.context<TrpcContext>().create();
export const router = trpc.router;
export const publicProcedure = trpc.procedure;
export const protectedProcedure = trpc.procedure.use(opts => {
  const { ctx } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }
  return opts.next({
    ctx,
  });
});

export async function getUserFromHeader(
  authorization: string | null | undefined
) {
  if (authorization) {
    const scheme = authorization.split(' ')[0];
    const token = authorization.split(' ')[1];
    if (scheme !== 'Bearer' || !token) return null;
    try {
      const user = (await validateJWT(token)) as JwtPayload;
      return user;
    } catch (err) {
      return null;
    }
  }
  return null;
}

export const createJwtContext = async (opt: any, c: Context) => {
  return {
    user: await getUserFromHeader(c.req.header('authorization')),
  };
};

export const onError = ({ error }: { error: TRPCError }) => {
  // Delete stack trace
  if (error.cause instanceof Error) {
    error.cause.stack = undefined;
  }
  if (error.stack) {
    error.stack = undefined;
  }
};
