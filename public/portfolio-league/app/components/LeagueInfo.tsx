'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { League } from '../types';

interface LeagueInfoProps {
  league: League;
}

export function LeagueInfo({ league }: LeagueInfoProps) {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const target = league.status === 'active' ? league.endTime : league.startTime;
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining('Ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, [league]);

  const getStatusColor = () => {
    switch (league.status) {
      case 'upcoming':
        return 'text-warning-yellow';
      case 'active':
        return 'text-success-green';
      case 'completed':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (league.status) {
      case 'upcoming':
        return 'Starts in';
      case 'active':
        return 'Ends in';
      case 'completed':
        return 'Completed';
      default:
        return '';
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Season */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Season</p>
          <p className="text-2xl font-bold">#{league.season}</p>
        </div>

        {/* Status & Time */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Status</p>
          <p className={`text-lg font-semibold ${getStatusColor()}`}>
            {league.status.toUpperCase()}
          </p>
          {league.status !== 'completed' && (
            <p className="text-sm text-gray-400 mt-1">
              {getStatusText()} {timeRemaining}
            </p>
          )}
        </div>

        {/* Prize Pool */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
          <p className="text-2xl font-bold text-success-green">
            ${league.prizePool.toLocaleString()} USDC
          </p>
        </div>

        {/* Participants */}
        <div>
          <p className="text-gray-400 text-sm mb-1">Participants</p>
          <p className="text-2xl font-bold">{league.participants}</p>
          <p className="text-sm text-gray-400 mt-1">
            Top {Math.ceil(league.participants * 0.1)} win prizes
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-400">Start</p>
            <p className="font-semibold">
              {format(new Date(league.startTime), 'MMM dd, HH:mm')}
            </p>
          </div>
          <div className="flex-1 mx-4 flex items-center">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-base-blue to-success-green transition-all"
                style={{
                  width: `${
                    league.status === 'completed'
                      ? 100
                      : league.status === 'active'
                      ? ((Date.now() - league.startTime) /
                          (league.endTime - league.startTime)) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400">End</p>
            <p className="font-semibold">
              {format(new Date(league.endTime), 'MMM dd, HH:mm')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
