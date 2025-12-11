'use client';

import { useState } from 'react';
import { Chamber } from '@/app/types';

interface CreateChamberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (chamber: Chamber, inviteCode?: string) => void;
}

export function CreateChamberModal({ isOpen, onClose, onCreated }: CreateChamberModalProps) {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [treasury, setTreasury] = useState(100);
  const [epochDuration, setEpochDuration] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chambers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          isPrivate,
          treasury,
          epochDuration,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onCreated(data.data.chamber, data.data.inviteCode);
        onClose();
        resetForm();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create chamber');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setIsPrivate(true);
    setTreasury(100);
    setEpochDuration(7);
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
        <h2 className="text-xl font-bold text-white mb-6">Create Private Chamber</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Chamber Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Alpha Traders Club"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Private Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div>
              <p className="text-white font-medium">Private Chamber</p>
              <p className="text-xs text-gray-400">Invite-only access</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPrivate ? 'bg-amber-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isPrivate ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Treasury */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Treasury (USDC)
            </label>
            <div className="flex gap-2">
              {[100, 250, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTreasury(amount)}
                  className={`flex-1 py-2 rounded-lg border transition-colors ${
                    treasury === amount
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Epoch Duration */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Epoch Duration
            </label>
            <div className="flex gap-2">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setEpochDuration(days)}
                  className={`flex-1 py-2 rounded-lg border transition-colors ${
                    epochDuration === days
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Chamber Summary</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Type</span>
                <span className="text-white">{isPrivate ? 'Private' : 'Public'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Treasury</span>
                <span className="text-green-400">${treasury} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration</span>
                <span className="text-white">{epochDuration} days</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                loading || !name
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-amber-500 text-black hover:bg-amber-400'
              }`}
            >
              {loading ? 'Creating...' : 'Create Chamber'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
