'use client';

import { useState } from 'react';
import { Chamber } from '@/app/types';

interface InviteShareCardProps {
  chamber: Chamber;
  inviteCode: string;
}

export function InviteShareCard({ chamber, inviteCode }: InviteShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${inviteCode}`
    : `/join?code=${inviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Imitatio Chamber!',
          text: `I've created a private chamber in Imitatio. Use code ${inviteCode} to join and compete!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Chamber Created!</h3>
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
          Active
        </span>
      </div>

      {/* Invite Code Display */}
      <div className="bg-gray-900/50 rounded-xl p-6 text-center mb-6">
        <p className="text-sm text-gray-400 mb-2">Invite Code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-bold text-amber-400 tracking-widest font-mono">
            {inviteCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            title="Copy code"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
      </div>

      {/* Chamber Details */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-xs text-gray-400">Treasury</p>
          <p className="text-lg font-bold text-green-400">${chamber.treasury}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Epoch</p>
          <p className="text-lg font-bold text-white">#{chamber.epoch}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400">Scholars</p>
          <p className="text-lg font-bold text-white">{chamber.scholars}</p>
        </div>
      </div>

      {/* Share Actions */}
      <div className="space-y-3">
        <button
          onClick={handleShare}
          className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Share Invite
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition-colors"
          >
            Copy Link
          </button>
          <a
            href={`https://warpcast.com/~/compose?text=Join%20my%20Imitatio%20Chamber!%20Use%20code%20${inviteCode}%20to%20compete.&embeds[]=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-500 transition-colors text-center"
          >
            Share on Farcaster
          </a>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 text-center mt-4">
        Share this code with friends to invite them to your private chamber
      </p>
    </div>
  );
}
