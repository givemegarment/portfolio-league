'use client';

import { useMemo } from 'react';
import { AllocationItem } from '@/lib/scoring';
import { getAsset, ASSET_CATEGORIES } from '@/lib/assets';

type PortfolioBreakdownProps = {
  allocations: AllocationItem[];
  showSectorAnalysis?: boolean;
};

type SectorAllocation = {
  name: string;
  percentage: number;
  color: string;
  assets: string[];
};

export default function PortfolioBreakdown({ 
  allocations, 
  showSectorAnalysis = true 
}: PortfolioBreakdownProps) {
  // Calculate sector allocations
  const sectorAllocations = useMemo(() => {
    const sectors: Record<string, SectorAllocation> = {};
    
    const sectorColors: Record<string, string> = {
      'Majors': '#F7931A',
      'Stablecoins': '#26A17B',
      'Base Ecosystem': '#0052FF',
      'L2 Tokens': '#FF0420',
      'DeFi': '#FF007A',
      'AI & Meme': '#4ADE80',
      'Alt L1s': '#9945FF',
    };

    for (const allocation of allocations) {
      // Find which sector this asset belongs to
      for (const [sectorName, symbols] of Object.entries(ASSET_CATEGORIES)) {
        if (sectorName === 'All') continue;
        if ((symbols as readonly string[]).includes(allocation.symbol)) {
          if (!sectors[sectorName]) {
            sectors[sectorName] = {
              name: sectorName,
              percentage: 0,
              color: sectorColors[sectorName] || '#71717A',
              assets: [],
            };
          }
          sectors[sectorName].percentage += allocation.percentage;
          sectors[sectorName].assets.push(allocation.symbol);
          break;
        }
      }
    }

    return Object.values(sectors).sort((a, b) => b.percentage - a.percentage);
  }, [allocations]);

  // Calculate diversification score
  const diversificationScore = useMemo(() => {
    if (allocations.length === 0) return 0;
    if (allocations.length === 1) return 0;
    
    const hhi = allocations.reduce(
      (sum, a) => sum + Math.pow(a.percentage / 100, 2),
      0
    );
    const maxDiversification = 1 / allocations.length;
    const diversification = (1 - hhi) / (1 - maxDiversification);
    
    return Math.round(diversification * 100);
  }, [allocations]);

  // Calculate risk assessment
  const riskAssessment = useMemo(() => {
    const highRiskAssets = ['PEPE', 'WIF', 'BONK', 'DEGEN', 'BRETT', 'TOSHI', 'HIGHER'];
    const stableAssets = ['USDC', 'USDT', 'DAI'];
    
    const highRiskPercentage = allocations
      .filter(a => highRiskAssets.includes(a.symbol))
      .reduce((sum, a) => sum + a.percentage, 0);
    
    const stablePercentage = allocations
      .filter(a => stableAssets.includes(a.symbol))
      .reduce((sum, a) => sum + a.percentage, 0);
    
    if (highRiskPercentage > 70) return { level: 'extreme', label: 'Degen', color: '#EF4444' };
    if (highRiskPercentage > 40) return { level: 'high', label: 'Aggressive', color: '#F97316' };
    if (stablePercentage > 50) return { level: 'low', label: 'Conservative', color: '#10B981' };
    return { level: 'medium', label: 'Moderate', color: '#F59E0B' };
  }, [allocations]);

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
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        Portfolio Analysis
      </h3>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-white/40">Assets</div>
          <div className="mt-1 text-lg font-bold text-white">
            {allocations.length}
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-white/40">Diversification</div>
          <div className="mt-1 text-lg font-bold text-white">
            {diversificationScore}%
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3 text-center">
          <div className="text-xs text-white/40">Risk Level</div>
          <div 
            className="mt-1 text-lg font-bold"
            style={{ color: riskAssessment.color }}
          >
            {riskAssessment.label}
          </div>
        </div>
      </div>

      {/* Sector breakdown */}
      {showSectorAnalysis && sectorAllocations.length > 0 && (
        <>
          <h4 className="mb-3 text-sm font-medium text-white/60">
            Sector Allocation
          </h4>
          
          {/* Sector bar */}
          <div className="mb-4 flex h-4 overflow-hidden rounded-full bg-white/5">
            {sectorAllocations.map((sector) => (
              <div
                key={sector.name}
                className="transition-all hover:opacity-80"
                style={{
                  width: `${sector.percentage}%`,
                  backgroundColor: sector.color,
                }}
                title={`${sector.name}: ${sector.percentage}%`}
              />
            ))}
          </div>

          {/* Sector list */}
          <div className="space-y-2">
            {sectorAllocations.map((sector) => (
              <div
                key={sector.name}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: sector.color }}
                  />
                  <span className="text-sm text-white/80">{sector.name}</span>
                  <span className="text-xs text-white/40">
                    ({sector.assets.join(', ')})
                  </span>
                </div>
                <span className="font-mono text-sm font-medium text-white">
                  {sector.percentage}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Risk warning */}
      {riskAssessment.level === 'extreme' && (
        <div className="mt-4 rounded-xl border border-accent-rose/20 bg-accent-rose/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-accent-rose">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            High Risk Portfolio
          </div>
          <p className="mt-1 text-xs text-white/50">
            This portfolio has significant exposure to volatile assets. 
            Consider diversifying to manage risk.
          </p>
        </div>
      )}
    </div>
  );
}




