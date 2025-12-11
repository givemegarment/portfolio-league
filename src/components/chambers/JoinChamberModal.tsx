'use client';

import { useState } from 'react';
import { Chamber } from '@/app/types';

interface JoinChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (chamber: Chamber) => void;
}

export function JoinChamberModal({ isOpen, onClose, onJoined }: JoinChamberModalProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundChamber, setFoundChamber] = useState<Chamber | null>(null);

  const handleLookup = async () => {
    if (!inviteCode.trim()) return;
    
    setLoading(true);
    setError(null);
    setFoundChamber(null);

    try {
      const response = await fetch(`/api/chambers?inviteCode=${inviteCode.trim().toUpperCase()}`);
      const data = await response.json();

      if (data.success && data.data.chambers.length > 0) {
        setFoundChamber(data.data.chambers[0]);
      } else {
        setError('Chamber not found. Please check the invite code.');
      }
    } catch (err) {
      setError('Failed to lookup chamber');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = () => {
    if (foundChamber) {
      onJoined(foundChamber);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setInviteCode('');
    setFoundChamber(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-white mb-2">Join Private Chamber</h2>
        <p className="text-gray-400 text-sm mb-6">
          Enter the invite code to join a private chamber
        </p>

        <div className="space-y-5">
          {/* Invite Code Input */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g., ABC123"
                maxLength={6}
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-xl tracking-widest font-mono focus:border-amber-500 focus:outline-none uppercase"
              />
              <button
                onClick={handleLookup}
                disabled={loading || !inviteCode.trim()}
                className={`px-4 rounded-lg font-medium transition-colors ${
                  loading || !inviteCode.trim()
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-500 text-black hover:bg-amber-400'
                }`}
              >
                {loading ? '...' : 'Look Up'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Found Chamber Preview */}
          {foundChamber && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Chamber Found!</h3>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                  {foundChamber.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Epoch</span>
                  <span className="text-white">#{foundChamber.epoch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Treasury</span>
                  <span className="text-green-400">${foundChamber.treasury} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Scholars</span>
                  <span className="text-white">{foundChamber.scholars}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={!foundChamber}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                !foundChamber
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 text-black hover:bg-amber-400'
              }`}
            >
              Join Chamber
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
