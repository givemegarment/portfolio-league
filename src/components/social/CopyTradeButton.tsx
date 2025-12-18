'use client';

import { useState } from 'react';

type Props = {
  fromAddress: string;
  toAddress: string;
  className?: string;
  onCopy?: () => void;
  season?: string;
  week?: number;
};

export default function CopyTradeButton({
  fromAddress,
  toAddress,
  className = '',
  onCopy,
  season,
  week,
}: Props) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!toAddress || copying) return;

    setCopying(true);
    
    try {
      const params = new URLSearchParams({
        from: fromAddress,
        to: toAddress,
        ...(season && { season }),
        ...(week && { week: week.toString() }),
      });
      
      const response = await fetch(
        `/api/portfolio/copy?${params}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setCopied(true);
        onCopy?.();
        setTimeout(() => setCopied(false), 3000);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to copy portfolio');
      }
    } catch (error) {
      console.error('Error copying portfolio:', error);
      alert('Failed to copy portfolio');
    } finally {
      setCopying(false);
    }
  };

  if (!toAddress || toAddress.toLowerCase() === fromAddress.toLowerCase()) {
    return null;
  }

  return (
    <button
      onClick={handleCopy}
      disabled={copying || copied}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-colors
        ${copied
          ? 'bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30'
          : 'bg-purple-600/20 text-purple-400 border border-purple-600/30 hover:bg-purple-600/30'
        }
        ${copying ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {copying ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Copying...
        </span>
      ) : copied ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Portfolio
        </span>
      )}
    </button>
  );
}
