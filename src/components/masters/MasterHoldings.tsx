'use client';

import { MasterHolding } from '@/lib/masters';
import { getAsset } from '@/lib/assets';
import { formatScore } from '@/lib/scoring';
import Image from 'next/image';

type MasterHoldingsProps = {
  holdings: MasterHolding[];
  showChart?: boolean;
};

export default function MasterHoldings({ holdings, showChart = true }: MasterHoldingsProps) {
  const totalValue = holdings.reduce((sum, h) => sum + (h.value || 0), 0);

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <svg
          className="h-5 w-5 text-base-blue"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        Current Holdings
      </h3>

      {/* Allocation chart */}
      {showChart && (
        <div className="mb-6">
          <div className="flex h-4 overflow-hidden rounded-full bg-white/5">
            {holdings.map((holding, index) => {
              const asset = getAsset(holding.symbol);
              return (
                <div
                  key={holding.symbol}
                  className="relative transition-all hover:opacity-80"
                  style={{
                    width: `${holding.percentage}%`,
                    backgroundColor: asset?.color || '#71717A',
                  }}
                  title={`${holding.symbol}: ${holding.percentage}%`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Holdings list */}
      <div className="space-y-3">
        {holdings.map((holding) => {
          const asset = getAsset(holding.symbol);
          
          return (
            <div
              key={holding.symbol}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3"
            >
              <div className="flex items-center gap-3">
                {asset?.logo ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white/10">
                    <Image
                      src={asset.logo}
                      alt={holding.symbol}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: asset?.color || '#71717A' }}
                  >
                    {holding.symbol.slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="font-medium text-white">{holding.symbol}</div>
                  <div className="text-xs text-white/40">
                    {asset?.name || holding.symbol}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono font-medium text-white">
                  {holding.percentage}%
                </div>
                {holding.change24h !== undefined && (
                  <div
                    className={`text-xs ${
                      holding.change24h >= 0
                        ? 'text-accent-emerald'
                        : 'text-accent-rose'
                    }`}
                  >
                    {formatScore(holding.change24h)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-sm text-white/40">Total Allocation</span>
        <span className="font-mono font-bold text-white">
          {holdings.reduce((sum, h) => sum + h.percentage, 0)}%
        </span>
      </div>
    </div>
  );
}




