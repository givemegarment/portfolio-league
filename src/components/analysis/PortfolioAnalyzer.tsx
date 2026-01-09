'use client';

import { useMemo, useState } from 'react';
import { AllocationItem } from '@/lib/scoring';
import {
  analyzePortfolio,
  FullAnalysis,
  getRiskGradeColor,
  CategoryBreakdown,
  PortfolioInsight,
  ScenarioResult,
} from '@/lib/analysis';

type PortfolioAnalyzerProps = {
  allocations: AllocationItem[];
  currentReturn?: number;
  btcReturn?: number;
  ethReturn?: number;
};

// ============ Sub-components ============

function RiskGauge({ riskScore, riskGrade }: { riskScore: number; riskGrade: string }) {
  const rotation = (riskScore / 100) * 180 - 90; // -90 to 90 degrees
  const gradeColor = getRiskGradeColor(riskGrade as 'A' | 'B' | 'C' | 'D' | 'F');

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-48 overflow-hidden">
        {/* Background arc */}
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full border-[16px] border-white/10"
          style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
        />
        {/* Colored segments */}
        <div className="absolute bottom-0 left-0 h-48 w-48">
          <svg viewBox="0 0 200 100" className="h-full w-full">
            <defs>
              <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="25%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="75%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <path
              d="M 16 100 A 84 84 0 0 1 184 100"
              fill="none"
              stroke="url(#riskGradient)"
              strokeWidth="16"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 h-20 w-1 origin-bottom rounded-full bg-white shadow-lg transition-transform duration-700"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        />
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-white shadow-lg" />
      </div>
      {/* Score display */}
      <div className="mt-4 text-center">
        <div className="text-4xl font-bold" style={{ color: gradeColor }}>
          {riskGrade}
        </div>
        <div className="text-sm text-white/60">
          Risk Score: {riskScore}/100
        </div>
      </div>
    </div>
  );
}

function CategoryDonut({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  let cumulativePercent = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          {breakdown.map((cat, i) => {
            const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
            const strokeDashoffset = -cumulativePercent;
            cumulativePercent += cat.percentage;

            return (
              <circle
                key={cat.category}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={cat.color}
                strokeWidth="3"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-white/60">{breakdown.length} types</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {breakdown.slice(0, 5).map(cat => (
          <div key={cat.category} className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-xs text-white/80">{cat.category}</span>
            <span className="text-xs font-mono text-white/50">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: PortfolioInsight }) {
  const config = {
    positive: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '✓', color: 'text-emerald-400' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: '!', color: 'text-amber-400' },
    suggestion: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: '?', color: 'text-blue-400' },
  }[insight.type];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-3`}>
      <div className="flex items-start gap-2">
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${config.color} bg-white/10`}>
          {config.icon}
        </span>
        <div>
          <div className={`text-sm font-medium ${config.color}`}>{insight.title}</div>
          <div className="mt-0.5 text-xs text-white/60">{insight.description}</div>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: ScenarioResult }) {
  const isPositive = scenario.portfolioReturn > 0;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="mb-2 text-sm font-medium text-white/80">{scenario.scenario}</div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-white/40">Your Portfolio</div>
          <div className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{scenario.portfolioReturn}%
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">vs BTC</div>
          <div className={`text-sm font-medium ${scenario.outperforms ? 'text-emerald-400' : 'text-rose-400'}`}>
            {scenario.outperforms ? '+' : ''}{(scenario.portfolioReturn - scenario.btcReturn).toFixed(1)}%
          </div>
        </div>
      </div>
      {/* Mini comparison bar */}
      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] text-white/40">YOU</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, Math.abs(scenario.portfolioReturn) + 50)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 text-[10px] text-white/40">BTC</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${Math.min(100, Math.abs(scenario.btcReturn) + 50)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BenchmarkComparison({ comparison, currentReturn }: {
  comparison: FullAnalysis['benchmarkComparison'];
  currentReturn: number;
}) {
  const items = [
    { label: 'vs BTC', value: comparison.vsBTC, color: '#F7931A' },
    { label: 'vs ETH', value: comparison.vsETH, color: '#627EEA' },
    { label: 'vs 50/50', value: comparison.vs5050, color: '#8B5CF6' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(item => (
        <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
          <div className="text-xs text-white/40">{item.label}</div>
          <div className={`mt-1 text-lg font-bold ${item.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {item.value >= 0 ? '+' : ''}{item.value}%
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all"
              style={{
                backgroundColor: item.value >= 0 ? '#10B981' : '#EF4444',
                width: `${Math.min(100, Math.abs(item.value) * 5 + 50)}%`,
                marginLeft: item.value < 0 ? 'auto' : 0,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============ Main Component ============

export default function PortfolioAnalyzer({
  allocations,
  currentReturn = 0,
  btcReturn = 0,
  ethReturn = 0,
}: PortfolioAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios'>('overview');

  const analysis = useMemo(() => {
    if (allocations.length === 0) return null;
    return analyzePortfolio(allocations, currentReturn, btcReturn, ethReturn);
  }, [allocations, currentReturn, btcReturn, ethReturn]);

  if (!analysis || allocations.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-surface-2 p-8 text-center">
        <div className="text-4xl">📊</div>
        <div className="mt-2 text-lg font-medium text-white">No Portfolio to Analyze</div>
        <div className="mt-1 text-sm text-white/60">Select assets to see analysis</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Narrative */}
      <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-white/60">Portfolio Type</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-3xl">{analysis.narrativeEmoji}</span>
              <span className="text-2xl font-bold text-white">{analysis.narrativeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <span className="text-sm text-white/60">Est. Volatility:</span>
            <span className="font-mono font-bold text-white">{analysis.volatilityEstimate}%</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-base-blue text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'scenarios'
              ? 'bg-base-blue text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10'
          }`}
        >
          What If Scenarios
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Risk & Category Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Risk Gauge */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Risk Assessment</h3>
              <RiskGauge riskScore={analysis.riskScore} riskGrade={analysis.riskGrade} />
              <div className="mt-4 text-center text-sm text-white/60">
                {analysis.riskScore >= 70
                  ? 'Conservative portfolio with lower volatility'
                  : analysis.riskScore >= 40
                  ? 'Balanced risk profile with moderate swings'
                  : 'Aggressive portfolio - expect significant volatility'}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
              <h3 className="mb-4 text-lg font-bold text-white">Category Mix</h3>
              <CategoryDonut breakdown={analysis.categoryBreakdown} />
            </div>
          </div>

          {/* Benchmark Comparison */}
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Benchmark Comparison</h3>
            <BenchmarkComparison comparison={analysis.benchmarkComparison} currentReturn={currentReturn} />
            <div className="mt-4 text-center text-xs text-white/40">
              Based on your current {currentReturn >= 0 ? '+' : ''}{currentReturn.toFixed(2)}% return this period
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
            <h3 className="mb-4 text-lg font-bold text-white">Insights</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {analysis.insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
            {analysis.insights.length === 0 && (
              <div className="text-center text-sm text-white/40">
                Add more assets to get personalized insights
              </div>
            )}
          </div>
        </>
      ) : (
        /* Scenarios Tab */
        <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
          <h3 className="mb-2 text-lg font-bold text-white">What If Scenarios</h3>
          <p className="mb-4 text-sm text-white/60">
            See how your portfolio would perform in different market conditions
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {analysis.scenarios.map((scenario, i) => (
              <ScenarioCard key={i} scenario={scenario} />
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-white/[0.03] p-3 text-xs text-white/40">
            <strong className="text-white/60">Note:</strong> Scenarios are estimates based on
            historical correlations. Actual results may vary significantly.
          </div>
        </div>
      )}
    </div>
  );
}
