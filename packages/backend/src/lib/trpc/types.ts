import { AnyRouter } from '@trpc/server';
import {
  FetchCreateContextFnOptions,
  FetchHandlerRequestOptions,
} from '@trpc/server/adapters/fetch';
import { Context } from 'hono';

export type tRPCOptions = Omit<
  FetchHandlerRequestOptions<AnyRouter>,
  'req' | 'endpoint' | 'createContext'
> &
  Partial<Pick<FetchHandlerRequestOptions<AnyRouter>, 'endpoint'>> & {
    createContext?(
      opts: FetchCreateContextFnOptions,
      c: Context
    ): Record<string, unknown> | Promise<Record<string, unknown>>;
  };
