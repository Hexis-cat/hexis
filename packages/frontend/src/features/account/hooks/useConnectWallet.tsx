import { wagmiConfig } from '@/providers/wagmi';
import { useModal } from 'connectkit';
import { useEffect, useRef, useState } from 'react';
import type { GetAccountReturnType } from 'wagmi/actions';
import { getAccount } from 'wagmi/actions';

interface UseConnectWalletOption {
  checkInterval?: number;
  onConnected?: (account: GetAccountReturnType) => void;
}

export function useConnectWallet(option?: UseConnectWalletOption) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const { setOpen, open } = useModal();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!open && status === 'pending') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setStatus('idle');
    }
  }, [open, status]);

  const connectAsync = async () => {
    setStatus('pending');
    setOpen(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const account = getAccount(wagmiConfig);
      if (account.isConnected) {
        // clear the interval once the account is connected
        option?.onConnected?.(account);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setStatus('success');
      }
    }, option?.checkInterval ?? 500);
  };

  return {
    status,
    connectAsync,
    isConnected: status === 'success',
    isPending: status === 'pending',
    isIdle: status === 'idle',
  };
}
