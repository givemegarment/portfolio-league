'use client';

import { useState, useEffect, useMemo } from 'react';

type SentimentLevel = 'extreme-fear' | 'fear' | 'neutral' | 'greed' | 'extreme-greed';

type SentimentData = {
  value: number;
  label: string;
  level: SentimentLevel;
  yesterday: number;
  weekAgo: number;
};

// Sentiment level configuration
const SENTIMENT_CONFIG: Record<SentimentLevel, { label: string; color: string; bgColor: string }> = {
  'extreme-fear': { label: 'Extreme Fear', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.15)' },
  'fear': { label: 'Fear', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.15)' },
  'neutral': { label: 'Neutral', color: '#EAB308', bgColor: 'rgba(234, 179, 8, 0.15)' },
  'greed': { label: 'Greed', color: '#84CC16', bgColor: 'rgba(132, 204, 22, 0.15)' },
  'extreme-greed': { label: 'Extreme Greed', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.15)' },
};

// Get sentiment level from value
function getSentimentLevel(value: number): SentimentLevel {
  if (value <= 25) return 'extreme-fear';
  if (value <= 45) return 'fear';
  if (value <= 55) return 'neutral';
  if (value <= 75) return 'greed';
  return 'extreme-greed';
}

// Get color for value (interpolated)
function getColorForValue(value: number): string {
  if (value <= 25) return '#EF4444';
  if (value <= 45) return '#F97316';
  if (value <= 55) return '#EAB308';
  if (value <= 75) return '#84CC16';
  return '#22C55E';
}

// Circular gauge component
function SentimentGauge({ value, animated = true }: { value: number; animated?: boolean }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value);
      return;
    }

    // Animate the value
    const duration = 1500;
    const startTime = Date.now();
    const startValue = animatedValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out-cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + diff * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated]);

  const radius = 90;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * Math.PI; // Half circle

  // Calculate the stroke offset for the current value
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  // Calculate needle rotation (0 = left, 180 = right)
  const needleRotation = (animatedValue / 100) * 180 - 90;

  const currentColor = getColorForValue(animatedValue);

  return (
    <div className="relative w-48 h-28">
      <svg
        width="192"
        height="112"
        viewBox="0 0 192 112"
        className="overflow-visible"
      >
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="25%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="75%" stopColor="#84CC16" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
          <filter id="gaugeShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
          <filter id="glowFilter">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background arc */}
        <path
          d="M 16 96 A 80 80 0 0 1 176 96"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored arc (gradient background) */}
        <path
          d="M 16 96 A 80 80 0 0 1 176 96"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Progress arc */}
        <path
          d="M 16 96 A 80 80 0 0 1 176 96"
          fill="none"
          stroke={currentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: animated ? 'none' : 'stroke-dashoffset 1.5s ease-out, stroke 0.3s ease',
            filter: 'url(#glowFilter)',
          }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = ((tick / 100) * 180 - 90) * (Math.PI / 180);
          const innerR = 68;
          const outerR = 74;
          const x1 = 96 + Math.cos(angle) * innerR;
          const y1 = 96 + Math.sin(angle) * innerR;
          const x2 = 96 + Math.cos(angle) * outerR;
          const y2 = 96 + Math.sin(angle) * outerR;

          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${needleRotation}deg)`,
            transformOrigin: '96px 96px',
            transition: animated ? 'none' : 'transform 1.5s ease-out',
          }}
        >
          {/* Needle shadow */}
          <polygon
            points="96,32 92,96 100,96"
            fill="rgba(0, 0, 0, 0.3)"
            transform="translate(2, 2)"
          />
          {/* Needle body */}
          <polygon
            points="96,32 92,96 100,96"
            fill={currentColor}
            filter="url(#gaugeShadow)"
          />
          {/* Needle center cap */}
          <circle
            cx="96"
            cy="96"
            r="8"
            fill="#1a1a2e"
            stroke={currentColor}
            strokeWidth="3"
          />
        </g>

        {/* Scale labels */}
        <text x="16" y="108" className="fill-white/40 text-[10px]" textAnchor="middle">0</text>
        <text x="176" y="108" className="fill-white/40 text-[10px]" textAnchor="middle">100</text>
      </svg>
    </div>
  );
}

// Comparison badge component
function ComparisonBadge({
  label,
  currentValue,
  previousValue,
}: {
  label: string;
  currentValue: number;
  previousValue: number;
}) {
  const diff = currentValue - previousValue;
  const isUp = diff > 0;
  const isNeutral = diff === 0;

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03]">
      <span className="text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-white/70">{previousValue}</span>
        {!isNeutral && (
          <span className={`text-xs font-mono ${isUp ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {isUp ? '+' : ''}{diff}
          </span>
        )}
        {isNeutral && (
          <span className="text-xs font-mono text-white/40">-</span>
        )}
      </div>
    </div>
  );
}

// Skeleton loader
function SentimentSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col items-center mb-6">
        <div className="w-48 h-28 rounded-full bg-white/10" />
        <div className="h-8 w-20 rounded bg-white/10 mt-4" />
        <div className="h-5 w-24 rounded bg-white/5 mt-2" />
      </div>
      <div className="space-y-2">
        <div className="h-10 rounded-lg bg-white/5" />
        <div className="h-10 rounded-lg bg-white/5" />
      </div>
    </div>
  );
}

export default function MarketSentiment({ className = '' }: { className?: string }) {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In production, this would fetch from an API like alternative.me/crypto/fear-and-greed-index/
    // For now, we'll simulate with mock data that updates periodically
    const fetchSentiment = async () => {
      try {
        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock data - in production, fetch from API
        // Generate a realistic value that changes slightly over time
        const baseValue = 45; // Base neutral value
        const hourlyVariation = Math.sin(Date.now() / (1000 * 60 * 60)) * 15; // Varies with hour
        const dailyVariation = Math.cos(Date.now() / (1000 * 60 * 60 * 24)) * 10; // Varies with day
        const noise = (Math.random() - 0.5) * 10;

        const currentValue = Math.round(
          Math.max(0, Math.min(100, baseValue + hourlyVariation + dailyVariation + noise))
        );

        // Mock historical values
        const yesterdayValue = Math.round(
          Math.max(0, Math.min(100, currentValue + (Math.random() - 0.5) * 20))
        );
        const weekAgoValue = Math.round(
          Math.max(0, Math.min(100, currentValue + (Math.random() - 0.5) * 30))
        );

        const level = getSentimentLevel(currentValue);

        setSentiment({
          value: currentValue,
          label: SENTIMENT_CONFIG[level].label,
          level,
          yesterday: yesterdayValue,
          weekAgo: weekAgoValue,
        });
        setError(null);
      } catch (err) {
        setError('Failed to load sentiment data');
        console.error('Error fetching sentiment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSentiment();

    // Refresh every 5 minutes
    const interval = setInterval(fetchSentiment, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const sentimentConfig = sentiment ? SENTIMENT_CONFIG[sentiment.level] : null;

  return (
    <div className={`rounded-2xl border border-white/5 bg-surface-2 backdrop-blur-sm overflow-hidden ${className}`}>
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-base-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-bold text-white">Fear & Greed Index</h3>
          </div>

          {/* Info tooltip trigger */}
          <button
            className="text-white/30 hover:text-white/50 transition-colors"
            title="Market sentiment based on various factors including volatility, momentum, and social media"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <SentimentSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="h-10 w-10 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-white/50 text-sm">{error}</p>
          </div>
        ) : sentiment ? (
          <>
            {/* Gauge */}
            <div className="flex flex-col items-center mb-6">
              <SentimentGauge value={sentiment.value} animated />

              {/* Current value display */}
              <div className="mt-4 text-center">
                <div
                  className="text-4xl font-bold font-mono"
                  style={{ color: sentimentConfig?.color }}
                >
                  {sentiment.value}
                </div>
                <div
                  className="mt-1 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: sentimentConfig?.bgColor,
                    color: sentimentConfig?.color,
                  }}
                >
                  {sentiment.label}
                </div>
              </div>
            </div>

            {/* Historical comparison */}
            <div className="space-y-2">
              <ComparisonBadge
                label="Yesterday"
                currentValue={sentiment.value}
                previousValue={sentiment.yesterday}
              />
              <ComparisonBadge
                label="Last Week"
                currentValue={sentiment.value}
                previousValue={sentiment.weekAgo}
              />
            </div>

            {/* Sentiment scale legend */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] text-white/40">
                <span>Extreme Fear</span>
                <span>Fear</span>
                <span>Neutral</span>
                <span>Greed</span>
                <span>Extreme Greed</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-red-500/60" />
                <div className="flex-1 bg-orange-500/60" />
                <div className="flex-1 bg-yellow-500/60" />
                <div className="flex-1 bg-lime-500/60" />
                <div className="flex-1 bg-green-500/60" />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
