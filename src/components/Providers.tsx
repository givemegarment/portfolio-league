'use client';

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { coinbaseWallet } from 'wagmi/connectors';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import ServiceWorkerRegistration from './ServiceWorkerRegistration';
import PWAInstallPrompt from './PWAInstallPrompt';
import NotificationPermission from './NotificationPermission';
import { initializeTheme } from '@/lib/theme';

// Note: OnchainKit styles are incompatible with Tailwind v3
// We'll use custom styling instead

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Portfolio League',
      preference: 'smartWalletOnly',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          chain={base}
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        >
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
          <NotificationPermission />
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
