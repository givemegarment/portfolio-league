import { Suspense } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import for the terminal (client-side only)
const Terminal = dynamic(
  () => import('@/components/terminal/Terminal'),
  {
    ssr: false,
    loading: () => <TerminalSkeleton />,
  }
);

export const metadata: Metadata = {
  title: 'Pro Terminal | Imitatio',
  description: 'Professional crypto trading terminal with real-time data from 14+ exchanges',
  openGraph: {
    title: 'Imitatio Pro Terminal',
    description: 'Professional crypto trading terminal with real-time data from 14+ exchanges',
    images: ['/og/terminal.png'],
  },
};

// Loading skeleton for the terminal
function TerminalSkeleton() {
  return (
    <div className="h-screen w-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-base-blue to-accent-cyan animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 rounded-xl bg-gradient-to-br from-base-blue to-accent-cyan blur-xl opacity-50 animate-pulse" />
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-white font-semibold">Loading Terminal</span>
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-base-blue animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-base-blue animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-base-blue animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Connection status */}
        <div className="mt-8 flex flex-col gap-2 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
            <span>Connecting to exchanges...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/20" />
            <span>Initializing charts...</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white/20" />
            <span>Loading layout...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TerminalPageProps {
  params: Promise<{
    layout?: string[];
  }>;
}

export default async function TerminalPage({ params }: TerminalPageProps) {
  const resolvedParams = await params;
  // Parse layout from URL: /terminal/[layoutId] or /terminal/share/[shareId]
  const layoutPath = resolvedParams.layout || [];
  const isShared = layoutPath[0] === 'share';
  const layoutId = isShared ? layoutPath[1] : layoutPath[0];

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <Suspense fallback={<TerminalSkeleton />}>
        <Terminal
          layoutId={layoutId}
          isShared={isShared}
        />
      </Suspense>
    </main>
  );
}
