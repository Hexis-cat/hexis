import { trpcServer } from '@hono/trpc-server';
import { onError, publicProcedure, router } from '@lib/trpc/trpc';
import { AuthTrpcServer } from '@modules/auth/auth.router';
import { BoothTrpcServer } from '@modules/booth/booth.router';
import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// CORS must be applied before route handlers (including tRPC)
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: [
      'content-type',
      'authorization',
      'x-requested-with',
      'x-trpc-source',
      'x-trpc-caller',
      'x-trpc-batch',
      'x-trpc-procedure',
      'x-trpc-version',
      'trpc-batch-mode',
    ],
  })
);

app.get('/health', c => {
  return c.json({ status: true });
});

app.use(
  '/',
  trpcServer({
    router: router({
      health: publicProcedure.query(() => {
        return { status: true };
      }),
    }),
    onError: onError,
  })
);

app.use('/auth/*', AuthTrpcServer);
app.use('/booths/*', BoothTrpcServer);

export default {
  port: process.env.PORT || 8080,
  fetch: app.fetch,
};
