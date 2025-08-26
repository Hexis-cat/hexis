import { trpcServer } from '@hono/trpc-server';
import {
  onError,
  router,
  createJwtContext,
  publicProcedure,
} from './lib/trpc/trpc';
import { AuthRouter } from './modules/auth/auth.router';
import { BoothRouter } from './modules/booth/booth.router';
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

const appRouter = router({
  ping: publicProcedure.query(() => ({ status: true })),
  auth: AuthRouter,
  booth: BoothRouter,
});

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: createJwtContext,
    onError: onError,
  })
);

export default {
  port: process.env.PORT || 8080,
  fetch: app.fetch,
};

export type AppRouter = typeof appRouter;
