'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useMiniKit } from '@coinbase/minikit';

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isReady } = useMiniKit();

  const handleConnect = () => {
    const connector = connectors[0];
    if (connector) {
      connect({ connector });
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="glass-card px-4 py-2">
          <p className="text-sm text-gray-400">Connected</p>
          <p className="font-mono text-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-6 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      className="px-8 py-3 bg-base-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
    >
      Connect Wallet
    </button>
  );
}
