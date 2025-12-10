'use client';

import { useState, useEffect } from 'react';
import { type Suggestion, type CoachAnalysis } from '@/lib/ai-coach';

type Allocation = {
  symbol: string;
  percentage: number;
};

type Props = {
  allocations: Allocation[];
  onApplySuggestion?: (suggestion: Suggestion) => void;
};

function RiskMeter({ score }: { score: number }) {
  const percentage = (score / 10) * 100;
  const color = score <= 3 ? '#10b981' : score <= 6 ? '#f59e0b' : '#f43f5e';
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/50">Risk Level</span>
        <span style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ScoreBadge({ label, value, maxValue = 10 }: { label: string; value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  const color = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#f43f5e';
  
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2">
      <span className="text-xs text-white/50">{label}</span>
      <span className="font-mono text-sm font-semibold" style={{ color }}>
        {typeof value === 'number' ? value.toFixed(1) : value}
      </span>
    </div>
  );
}

function SuggestionCard({ 
  suggestion, 
  onApply 
}: { 
  suggestion: Suggestion; 
  onApply?: () => void;
}) {
  const isIncrease = suggestion.type === 'increase' || suggestion.type === 'add';
  const confidencePercent = Math.round(suggestion.confidence * 100);
  
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {suggestion.type === 'add' ? '➕' : 
             suggestion.type === 'remove' ? '➖' :
             suggestion.type === 'increase' ? '📈' :
             suggestion.type === 'decrease' ? '📉' : '⚖️'}
          </span>
          <div>
            <div className="font-semibold text-white">
              {suggestion.type === 'add' ? 'Add' :
               suggestion.type === 'remove' ? 'Remove' :
               suggestion.type === 'increase' ? 'Increase' :
               suggestion.type === 'decrease' ? 'Decrease' : 'Rebalance'} {suggestion.asset}
            </div>
            <div className="text-xs text-white/50">
              {suggestion.currentAllocation}% → {suggestion.suggestedAllocation}%
            </div>
          </div>
        </div>
        
        {/* Confidence badge */}
        <div 
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: confidencePercent >= 70 
              ? 'rgba(16, 185, 129, 0.2)' 
              : confidencePercent >= 50 
              ? 'rgba(245, 158, 11, 0.2)'
              : 'rgba(244, 63, 94, 0.2)',
            color: confidencePercent >= 70 
              ? '#10b981' 
              : confidencePercent >= 50 
              ? '#f59e0b'
              : '#f43f5e',
          }}
        >
          {confidencePercent}% confident
        </div>
      </div>
      
      {/* Reasoning */}
      <p className="text-sm text-white/70">{suggestion.reasoning}</p>
      
      {/* Risk impact */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-white/40">Risk impact:</span>
        <span 
          className="text-xs font-medium"
          style={{
            color: suggestion.riskImpact === 'lower' ? '#10b981' :
                   suggestion.riskImpact === 'higher' ? '#f43f5e' : '#71717a'
          }}
        >
          {suggestion.riskImpact === 'lower' ? '↓ Lower' :
           suggestion.riskImpact === 'higher' ? '↑ Higher' : '→ Neutral'}
        </span>
      </div>
      
      {/* Apply button */}
      {onApply && (
        <button
          onClick={onApply}
          className="w-full rounded-lg bg-base-blue/20 px-4 py-2 text-sm font-medium text-base-blue hover:bg-base-blue/30 transition-colors"
        >
          Apply Suggestion
        </button>
      )}
    </div>
  );
}

export default function CoachPanel({ allocations, onApplySuggestion }: Props) {
  const [analysis, setAnalysis] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Fetch analysis when allocations change (debounced)
  useEffect(() => {
    const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
    
    // Only analyze if we have valid allocations
    if (totalPercentage !== 100 || allocations.length === 0) {
      setAnalysis(null);
      return;
    }

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch('/api/coach/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ allocations }),
        });
        
        if (!res.ok) throw new Error('Failed to get suggestions');
        
        const data = await res.json();
        setAnalysis(data);
      } catch (e) {
        setError('Could not load AI suggestions');
        console.error('Coach error:', e);
      } finally {
        setLoading(false);
      }
    };

    // Debounce
    const timer = setTimeout(fetchAnalysis, 500);
    return () => clearTimeout(timer);
  }, [allocations]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <svg className="h-5 w-5 text-purple-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-white">Based AI Coach</div>
            <div className="text-xs text-white/50">Analyzing your portfolio...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <span className="text-xl">🤖</span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-white">Based AI Coach</div>
            <div className="text-xs text-white/50">
              {analysis.suggestions.length} suggestions • Risk {analysis.riskScore}/10
            </div>
          </div>
        </div>
        
        <svg 
          className={`h-5 w-5 text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-purple-500/10 p-4 space-y-4">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-2">
            <RiskMeter score={analysis.riskScore} />
            <ScoreBadge label="Diversification" value={analysis.diversificationScore} />
          </div>

          {/* Insights */}
          {analysis.insights.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Insights
              </div>
              <div className="space-y-1">
                {analysis.insights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className="text-sm text-white/70 bg-white/[0.03] rounded-lg px-3 py-2"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/40 uppercase tracking-wider">
                Suggestions
              </div>
              <div className="space-y-3">
                {analysis.suggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onApply={onApplySuggestion ? () => onApplySuggestion(suggestion) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="pt-2 border-t border-white/5">
            <p className="text-xs text-white/30 text-center">
              ⚠️ Not financial advice. Suggestions are based on historical patterns and may not predict future performance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}




