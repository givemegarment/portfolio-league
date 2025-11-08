'use client';

interface SeasonInfoProps {
  week: number;
  timeRemaining: string;
}

export function SeasonInfo({ week, timeRemaining }: SeasonInfoProps) {
  return (
    <div className="bg-gradient-to-r from-base-blue/20 to-purple-600/20 rounded-xl p-6 mb-8 border border-base-blue/30">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Current Week</h3>
          <p className="text-3xl font-bold text-white">{week}</p>
        </div>
        <div className="text-right">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide">Time Remaining</h3>
          <p className="text-3xl font-bold text-base-blue">{timeRemaining}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Prize Pool</span>
          <span className="text-green-400 font-semibold">1,000 USDC</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-400">Total Participants</span>
          <span className="text-white font-semibold">247 players</span>
        </div>
      </div>
    </div>
  );
}
