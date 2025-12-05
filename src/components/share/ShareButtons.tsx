'use client';

import { useState } from 'react';

type Props = {
  address?: string;
  allocations?: { symbol: string; percentage: number }[];
  score?: number;
  rank?: number;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';

export default function ShareButtons({ address, allocations, score, rank }: Props) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!address || !allocations || allocations.length === 0) {
    return null;
  }

  // Build share URLs
  const frameUrl = `${BASE_URL}/api/frame/portfolio?address=${address}`;
  
  const ogParams = new URLSearchParams();
  ogParams.set('address', address);
  ogParams.set('allocations', JSON.stringify(allocations));
  if (score !== undefined) ogParams.set('score', score.toString());
  if (rank !== undefined) ogParams.set('rank', rank.toString());
  const imageUrl = `${BASE_URL}/api/og/portfolio?${ogParams.toString()}`;

  // Share text
  const shareText = score !== undefined
    ? `My portfolio is ${score >= 0 ? '+' : ''}${score.toFixed(2)}% this week on Portfolio League! 🎯 Think you can beat it?`
    : `Check out my Portfolio League picks! 🎯 Think you can beat it?`;

  // Twitter/X share URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(frameUrl)}`;

  // Warpcast (Farcaster) share URL
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(frameUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(frameUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      {/* Share Button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Portfolio
      </button>

      {/* Share Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-surface-2 p-6 shadow-2xl">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Share Your Portfolio</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview */}
            <div className="mb-6 overflow-hidden rounded-xl border border-white/10">
              <img
                src={imageUrl}
                alt="Portfolio preview"
                className="w-full"
              />
            </div>

            {/* Share options */}
            <div className="space-y-3">
              {/* Warpcast */}
              <a
                href={warpcastUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-left transition-all hover:bg-purple-500/20"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Share on Warpcast</div>
                  <div className="text-xs text-white/50">Post as a Farcaster Frame</div>
                </div>
                <svg className="ml-auto h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Twitter/X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-white">Share on X</div>
                  <div className="text-xs text-white/50">Post with image preview</div>
                </div>
                <svg className="ml-auto h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Copy Link */}
              <button
                onClick={copyLink}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition-all hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  {copied ? (
                    <svg className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </div>
                  <div className="text-xs text-white/50">Share anywhere with Frame support</div>
                </div>
              </button>
            </div>

            {/* Frame info */}
            <div className="mt-6 rounded-xl bg-base-blue/10 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-white/70">
                  <span className="font-medium text-base-blue">Farcaster Frame:</span> When shared on Warpcast, friends can see your portfolio and challenge you directly in their feed!
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


