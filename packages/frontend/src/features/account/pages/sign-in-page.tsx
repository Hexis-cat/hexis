import { shortenWalletAddress } from '@/lib/formatter';
import { useConnectWallet } from '../hooks/useConnectWallet';
import { useAccount } from 'wagmi';

export default function SignInPage() {
  const { connectAsync, isConnected } = useConnectWallet();
  const { address } = useAccount();

  return (
    <div>
      <button onClick={connectAsync}>
        {isConnected ? shortenWalletAddress(address!) : 'Connect Wallet'}
      </button>
    </div>
  );
}
