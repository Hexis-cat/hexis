import {
  createTRPCReact,
  httpBatchLink,
  createTRPCProxyClient,
} from '@trpc/react-query';
import type { AppRouter } from '../../../backend/src/index';
import env from '@/lib/schema/env';

// TRPC React Query
export const trpc = createTRPCReact<AppRouter>();

// TRPC Client
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.data?.VITE_API_HOST}/trpc`,
    }),
  ],
});
