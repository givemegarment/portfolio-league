'use client';

import { Chamber } from '@/app/types';

interface ChamberCardProps {
  chamber: Chamber;
  onJoin?: (chamber: Chamber) => void;
}

export function ChamberCard({ chamber, onJoin }: ChamberCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTimeRemaining = () => {
    const now = Date.now();
    const target = chamber.status === 'active' ? chamber.endTime : chamber.startTime;
    const diff = target - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">Epoch #{chamber.epoch}</h3>
            {chamber.isPrivate && (
              <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                Private
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">ID: {chamber.id.slice(0, 12)}...</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(chamber.status)}`}>
          {chamber.status.toUpperCase()}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Treasury</p>
          <p className="text-lg font-bold text-green-400">${chamber.treasury}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-xs text-gray-400">Scholars</p>
          <p className="text-lg font-bold text-white">{chamber.scholars}</p>
        </div>
      </div>

      {/* Time Info */}
      <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg mb-4">
        <span className="text-sm text-gray-400">
          {chamber.status === 'active' ? 'Ends in' : 'Starts in'}
        </span>
        <span className="text-sm font-semibold text-amber-400">{getTimeRemaining()}</span>
      </div>

      {/* Action */}
      {chamber.status !== 'completed' && onJoin && (
        <button
          onClick={() => onJoin(chamber)}
          className="w-full py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors"
        >
          {chamber.status === 'active' ? 'Enter Chamber' : 'Register'}
        </button>
      )}
    </div>
  );
}
