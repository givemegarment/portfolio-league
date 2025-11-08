'use client';
export default function Providers({ children }: { children: React.ReactNode }) {
  // Keep it minimal to avoid MiniKit/OnchainKit during SSR/prerender.
  return <>{children}</>;
}
