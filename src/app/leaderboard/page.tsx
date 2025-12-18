'use client';

import { useState, useEffect } from 'react';
import Nav from '@/components/chrome/Nav';
import EnhancedLeaderboard from '@/components/leaderboard/EnhancedLeaderboard';

type WeekOption = {
  season: string;
  week: number;
  label: string;
};

export default function LeaderboardPage() {
  const [address, setAddress] = useState<string | undefined>();
  const [selectedSeason, setSelectedSeason] = useState<string>('s1');
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weekOptions, setWeekOptions] = useState<WeekOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Get address from window.ethereum if available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const fetchWeekOptions = async () => {
      try {
        // In a real app, fetch from API
        // For now, generate options based on current week
        const currentDate = new Date();
        const currentWeek = Math.floor((currentDate.getTime() - new Date('2024-12-02').getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
        
        const options: WeekOption[] = [];
        for (let w = currentWeek; w >= Math.max(1, currentWeek - 10); w--) {
          options.push({
            season: 's1',
            week: w,
            label: `Week ${w}`,
          });
        }
        
        setWeekOptions(options);
        if (options.length > 0 && !selectedWeek) {
          setSelectedWeek(options[0].week);
        }
      } catch (error) {
        console.error('Error fetching week options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekOptions();
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-white/60">See how you rank against other players</p>
        </div>

        {/* Week/Season Selector */}
        {!loading && weekOptions.length > 0 && (
          <div className="mb-6 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">Season:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-base-blue"
              >
                <option value="s1">Season 1</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">Week:</label>
              <select
                value={selectedWeek || ''}
                onChange={(e) => setSelectedWeek(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-1.5 text-sm bg-white/5 text-white border border-white/10 rounded-lg focus:outline-none focus:border-base-blue"
              >
                {weekOptions.map((option) => (
                  <option key={`${option.season}-${option.week}`} value={option.week}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <EnhancedLeaderboard
          showFilters={true}
          defaultTimeframe="weekly"
          limit={100}
          week={selectedWeek}
          season={selectedSeason}
          highlightAddress={address}
          currentUserAddress={address}
        />
      </main>
    </div>
  );
}
