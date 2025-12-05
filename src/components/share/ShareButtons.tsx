'use client';

import { useState, useEffect } from 'react';

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
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Fetch user's referral code when component mounts
  useEffect(() => {
    if (!address) return;

    const fetchReferralCode = async () => {
      try {
        const response = await fetch(`/api/referral?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          setReferralCode(data.code);
        }
      } catch (err) {
        console.error('Failed to fetch referral code:', err);
      }
    };

    fetchReferralCode();
  }, [address]);

  if (!address || !allocations || allocations.length === 0) {
    return null;
  }

  // Build image URL for OG image
  const ogParams = new URLSearchParams();
  ogParams.set('address', address);
  ogParams.set('allocations', JSON.stringify(allocations));
  if (score !== undefined) ogParams.set('score', score.toString());
  if (rank !== undefined) ogParams.set('rank', rank.toString());
  const imageUrl = `${BASE_URL}/api/og/portfolio?${ogParams.toString()}`;

  // Direct site URL with referral code
  const siteUrlWithRef = referralCode ? `${BASE_URL}?ref=${referralCode}` : BASE_URL;

  // Share text with link included (no embed card)
  const shareText = score !== undefined
    ? `My portfolio is ${score >= 0 ? '+' : ''}${score.toFixed(2)}% this week on Portfolio League! 🎯 Think you can beat it?`
    : `Check out my Portfolio League picks! 🎯 Think you can beat it?`;
  
  const shareTextWithLink = `${shareText}\n\n${siteUrlWithRef}`;

  // Twitter/X share URL - plain text with link (user attaches downloaded image)
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTextWithLink)}`;

  // Warpcast share URL - plain text with link (user attaches downloaded image)
  const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareTextWithLink)}`;

  // Download the portfolio image as PNG
  const downloadImage = async () => {
    setDownloading(true);
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${address.slice(0, 6)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(true);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrlWithRef);
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
            <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
              <img
                src={imageUrl}
                alt="Portfolio preview"
                className="w-full"
              />
            </div>

            {/* Step 1: Download Image */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-base-blue text-xs font-bold text-white">1</div>
                <span className="text-sm font-medium text-white">Download your portfolio image</span>
              </div>
              <button
                onClick={downloadImage}
                disabled={downloading}
                className={`flex w-full items-center justify-center gap-3 rounded-xl px-4 py-4 text-left transition-all ${
                  downloaded 
                    ? 'border border-accent-emerald/30 bg-accent-emerald/10' 
                    : 'bg-gradient-to-r from-base-blue to-purple-600 hover:opacity-90'
                }`}
              >
                {downloading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-semibold text-white">Downloading...</span>
                  </>
                ) : downloaded ? (
                  <>
                    <svg className="h-5 w-5 text-accent-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-semibold text-accent-emerald">Image Downloaded!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="font-semibold text-white">Download Image (PNG)</span>
                  </>
                )}
              </button>
            </div>

            {/* Step 2: Share */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-xs font-bold text-white">2</div>
                <span className="text-sm font-medium text-white">Share and attach image</span>
              </div>
              
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
                    <div className="text-xs text-white/50">Attach downloaded image to post</div>
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
                    <div className="text-xs text-white/50">Attach downloaded image to post</div>
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
                    <div className="text-xs text-white/50">Copy referral link to clipboard</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="rounded-xl bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <svg className="mt-0.5 h-5 w-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-white/50">
                  Download the image first, then click share. In the compose window, attach the downloaded image to your post for the best preview.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}


