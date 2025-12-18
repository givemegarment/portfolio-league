'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts';

type Props = {
  address: string;
  className?: string;
};

type WeeklyData = {
  week: number;
  season: string;
  return: number;
  rank: number;
  totalParticipants: number;
  timestamp: number;
};

export default function WeeklyPerformanceStats({ address, className = '' }: Props) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/portfolio/history?address=${address}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        
        if (data.history && Array.isArray(data.history)) {
          const sorted = [...data.history]
            .sort((a, b) => a.week - b.week)
            .map((entry: any) => ({
              week: entry.week,
              season: entry.season,
              return: entry.finalScore || 0,
              rank: entry.rank || 0,
              totalParticipants: entry.totalParticipants || 0,
              timestamp: entry.timestamp,
            }));
          
          setWeeklyData(sorted);
        }
      } catch (err) {
        console.error('Error fetching weekly stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchData();
    }
  }, [address]);

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <svg className="h-8 w-8 animate-spin text-base-blue" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || weeklyData.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 text-center ${className}`}>
        <p className="text-sm text-white/60">{error || 'No weekly data available'}</p>
      </div>
    );
  }

  // Calculate statistics
  const currentWeek = weeklyData[weeklyData.length - 1];
  const bestWeek = weeklyData.reduce((best, week) => 
    week.return > best.return ? week : best
  );
  const worstWeek = weeklyData.reduce((worst, week) => 
    week.return < worst.return ? week : worst
  );
  const averageReturn = weeklyData.reduce((sum, week) => sum + week.return, 0) / weeklyData.length;
  const bestRank = weeklyData.reduce((best, week) => 
    week.rank > 0 && (best === 0 || week.rank < best) ? week.rank : best
  , 0);

  // Prepare chart data
  const chartData = weeklyData.map(week => ({
    week: `W${week.week}`,
    return: week.return,
    rank: week.rank > 0 ? week.rank : null,
    percentile: week.totalParticipants > 0 && week.rank > 0
      ? ((week.totalParticipants - week.rank + 1) / week.totalParticipants) * 100
      : null,
  }));

  // Calculate week-over-week changes
  const weekOverWeek = weeklyData.slice(1).map((week, idx) => {
    const prevWeek = weeklyData[idx];
    return {
      week: `W${week.week}`,
      change: week.return - prevWeek.return,
    };
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Current Week ROI</div>
          <div className={`text-2xl font-bold ${currentWeek.return >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {currentWeek.return >= 0 ? '+' : ''}{currentWeek.return.toFixed(2)}%
          </div>
          <div className="text-xs text-white/40 mt-1">
            Rank: {currentWeek.rank > 0 ? `#${currentWeek.rank}` : 'N/A'}
          </div>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Best Week</div>
          <div className="text-2xl font-bold text-accent-emerald">
            +{bestWeek.return.toFixed(2)}%
          </div>
          <div className="text-xs text-white/40 mt-1">
            Week {bestWeek.week}
          </div>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Worst Week</div>
          <div className="text-2xl font-bold text-accent-rose">
            {worstWeek.return.toFixed(2)}%
          </div>
          <div className="text-xs text-white/40 mt-1">
            Week {worstWeek.week}
          </div>
        </div>
        
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
          <div className="text-xs text-white/40 mb-1">Best Rank</div>
          <div className="text-2xl font-bold text-white">
            {bestRank > 0 ? `#${bestRank}` : 'N/A'}
          </div>
          <div className="text-xs text-white/40 mt-1">
            Avg: {averageReturn >= 0 ? '+' : ''}{averageReturn.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Weekly Returns Chart */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <h3 className="text-lg font-bold text-white mb-4">Weekly Returns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
            />
            <Bar
              dataKey="return"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.return >= 0 ? '#10B981' : '#F43F5E'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking Progression */}
      {chartData.some(d => d.rank !== null) && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Ranking Progression</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.filter(d => d.rank !== null)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                reversed
                label={{ value: 'Rank', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.5)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `#${value}`}
              />
              <Line
                type="monotone"
                dataKey="rank"
                stroke="#0052FF"
                strokeWidth={2}
                dot={{ fill: '#0052FF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Week-over-Week Comparison */}
      {weekOverWeek.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Week-over-Week Change</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekOverWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                tickFormatter={(value) => `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
              />
              <Bar dataKey="change" radius={[4, 4, 0, 0]}>
                {weekOverWeek.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.change >= 0 ? '#10B981' : '#F43F5E'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
