'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAsset } from '@/lib/assets';

type Transaction = {
  id: string;
  address: string;
  type: 'allocation_change' | 'portfolio_submit';
  timestamp: number;
  week: number;
  season: string;
  changes: Array<{
    symbol: string;
    oldPercentage?: number;
    newPercentage: number;
    action: 'added' | 'removed' | 'modified';
  }>;
  entryPrices: Record<string, number>;
  pnl?: number;
};

type TransactionStats = {
  totalTransactions: number;
  totalPnL: number;
  winRate: number;
  averagePnL: number;
};

type Props = {
  address: string;
  className?: string;
};

export default function TransactionHistory({ address, className = '' }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'allocation_change' | 'portfolio_submit'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range
        const now = Date.now();
        let startTime: number | undefined;
        
        switch (dateRange) {
          case 'week':
            startTime = now - 7 * 24 * 60 * 60 * 1000;
            break;
          case 'month':
            startTime = now - 30 * 24 * 60 * 60 * 1000;
            break;
          case 'all':
            startTime = undefined;
            break;
        }

        const params = new URLSearchParams({
          address,
          limit: '100',
          ...(startTime && { startTime: startTime.toString() }),
          ...(filter !== 'all' && { type: filter }),
        });

        const response = await fetch(`/api/portfolio/transactions?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data.transactions || []);
        setStats(data.stats || null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchTransactions();
    }
  }, [address, filter, dateRange]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Type', 'Changes', 'P&L'];
    const rows = transactions.map(t => {
      const changes = t.changes.map(c => {
        if (c.action === 'added') {
          return `${c.symbol} +${c.newPercentage}%`;
        } else if (c.action === 'removed') {
          return `${c.symbol} -${c.oldPercentage}%`;
        } else {
          return `${c.symbol} ${c.oldPercentage}% → ${c.newPercentage}%`;
        }
      }).join('; ');
      
      return [
        formatDate(t.timestamp),
        t.type === 'portfolio_submit' ? 'Portfolio Submit' : 'Allocation Change',
        changes,
        t.pnl !== undefined ? t.pnl.toFixed(2) + '%' : 'N/A',
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${address.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

  if (error) {
    return (
      <div className={`rounded-2xl border border-accent-rose/20 bg-accent-rose/5 p-6 text-center ${className}`}>
        <p className="text-sm text-accent-rose">{error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Transaction History</h3>
            <p className="text-xs text-white/40">All portfolio changes and submissions</p>
          </div>
          
          {transactions.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              Export CSV
            </button>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl bg-white/[0.02] p-3 text-center border border-white/5">
              <div className="text-lg font-bold text-white">{stats.totalTransactions}</div>
              <div className="text-xs text-white/40">Total</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 text-center border border-white/5">
              <div className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}%
              </div>
              <div className="text-xs text-white/40">Total P&L</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 text-center border border-white/5">
              <div className="text-lg font-bold text-white">{stats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-white/40">Win Rate</div>
            </div>
            <div className="rounded-xl bg-white/[0.02] p-3 text-center border border-white/5">
              <div className={`text-lg font-bold ${stats.averagePnL >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                {stats.averagePnL >= 0 ? '+' : ''}{stats.averagePnL.toFixed(2)}%
              </div>
              <div className="text-xs text-white/40">Avg P&L</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Type:</span>
            {(['all', 'allocation_change', 'portfolio_submit'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  filter === f
                    ? 'bg-base-blue text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'portfolio_submit' ? 'Submissions' : 'Changes'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Period:</span>
            {(['all', 'week', 'month'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  dateRange === r
                    ? 'bg-base-blue text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All Time' : r === 'week' ? '7d' : '30d'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-white/5">
        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-white/20 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-white/60">No transactions found</p>
            <p className="text-xs text-white/40 mt-1">Your portfolio changes will appear here</p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const isPositive = transaction.pnl !== undefined && transaction.pnl >= 0;

            return (
              <div
                key={transaction.id}
                className="p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        transaction.type === 'portfolio_submit'
                          ? 'bg-base-blue/20 text-base-blue border border-base-blue/30'
                          : 'bg-purple-600/20 text-purple-400 border border-purple-600/30'
                      }`}>
                        {transaction.type === 'portfolio_submit' ? 'Portfolio Submit' : 'Allocation Change'}
                      </span>
                      <span className="text-xs text-white/40">
                        Week {transaction.week} • {transaction.season}
                      </span>
                      <span className="text-xs text-white/30">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>

                    {/* Changes */}
                    <div className="flex flex-wrap gap-2">
                      {transaction.changes.map((change, idx) => {
                        const asset = getAsset(change.symbol);
                        const isPositiveChange = change.action === 'added' || 
                          (change.action === 'modified' && (change.newPercentage || 0) > (change.oldPercentage || 0));

                        return (
                          <div
                            key={`${change.symbol}-${idx}`}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.02] border border-white/5"
                          >
                            {asset?.logo && (
                              <Image
                                src={asset.logo}
                                alt={change.symbol}
                                width={16}
                                height={16}
                                className="rounded-full"
                              />
                            )}
                            <span className="font-mono text-xs font-medium text-white">{change.symbol}</span>
                            {change.action === 'added' && (
                              <span className="text-xs text-accent-emerald font-mono">
                                +{change.newPercentage}%
                              </span>
                            )}
                            {change.action === 'removed' && (
                              <span className="text-xs text-accent-rose font-mono">
                                -{change.oldPercentage}%
                              </span>
                            )}
                            {change.action === 'modified' && (
                              <span className="text-xs text-white/60 font-mono">
                                {change.oldPercentage}% → {change.newPercentage}%
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* P&L */}
                  {transaction.pnl !== undefined && (
                    <div className="text-right">
                      <div className="text-xs text-white/40 mb-1">P&L</div>
                      <div className={`text-sm font-mono font-bold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                        {isPositive ? '+' : ''}{transaction.pnl.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
