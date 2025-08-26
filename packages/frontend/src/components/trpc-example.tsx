import { trpc } from '@/requests/trpc';

export function TRPCExample() {
  const pingQuery = trpc.ping.useQuery();

  const nonceQuery = trpc.auth.nonce.useQuery({
    address: '0x0000000000000000000000000000000000000000'.toLowerCase(),
  });

  const boothsQuery = trpc.booth.getBooths.useQuery({ page: 1, size: 10 });

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>tRPC API 테스트</h2>

      <div className='space-y-4'>
        <div>
          <h3 className='font-semibold'>Ping Check:</h3>
          <p>Status: {pingQuery.data?.status ? 'OK' : 'Error'}</p>
        </div>

        <div>
          <h3 className='font-semibold'>Nonce:</h3>
          <p>Nonce: {nonceQuery.data?.nonce || 'Loading...'}</p>
        </div>

        <div>
          <h3 className='font-semibold'>Booths:</h3>
          <p>Count: {boothsQuery.data?.count || 0}</p>
        </div>
      </div>
    </div>
  );
}
