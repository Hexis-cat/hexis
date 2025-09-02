import { ClientError, NetworkError, ServerError } from '@/lib/error';
import env from '@/lib/schema/env';

/**
 * Fetcher utility
 * @description - This project mainly uses TRPC, but in case there are requests that are hard to handle with TRPC,
 * this fetcher utility is provided to handle such requests.
 */
export async function fetcher<TData = unknown>({
  url,
  external = false,
  options = {},
}: {
  url: string;
  external?: boolean;
  options?: RequestInit;
}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const fetchUrl = external ? url : `${env.data?.VITE_API_HOST}${url}`;

    const res = await fetch(fetchUrl, {
      ...options,
      headers,
    });

    if (!res.ok) {
      // Error from server
      const error = await res.json();

      if (error?.statusCode && error?.message) {
        throw new ServerError(error.statusCode, error.message);
      }
    }

    return res.json() as Promise<TData>;
  } catch (error) {
    if (error instanceof ServerError) {
      throw error;
    }

    if (
      !navigator.onLine ||
      (error instanceof TypeError && error.message.includes('fetch'))
    ) {
      throw new NetworkError();
    }

    throw new ClientError('An unknown error occurred');
  }
}
