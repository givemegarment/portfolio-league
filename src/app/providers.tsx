'use client'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { base } from 'viem/chains'
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OnchainKitProvider chain={base} miniKit={{ enabled: true }} apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}>
      {children}
    </OnchainKitProvider>
  )
}
