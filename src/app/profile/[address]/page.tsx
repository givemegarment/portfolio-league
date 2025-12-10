import { Metadata } from 'next';
import Nav from '@/components/chrome/Nav';
import StatCard from '@/components/profile/StatCard';
import PortfolioHistoryList from '@/components/profile/PortfolioHistoryList';
import AchievementBadges from '@/components/profile/AchievementBadges';
import PerformanceChart from '@/components/portfolio/PerformanceChart';

type Props = {
  params: { address: string };
};

// Generate metadata for the page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shortAddress = `${params.address.slice(0, 6)}...${params.address.slice(-4)}`;
  
  return {
    title: `${shortAddress} - Portfolio League`,
    description: `View ${shortAddress}'s portfolio performance and competition history on Portfolio League.`,
  };
}

// Fetch player stats
async function getPlayerStats(address: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/user/${address}/stats`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return null;
  }
}

// Fetch portfolio history
async function getPortfolioHistory(address: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/portfolio/history?address=${address}`, {
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return [];
  }
}

// Fetch achievements
async function getAchievements(address: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/user/${address}/achievements`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.achievements || [];
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }
}

function addressToColor(address: string): string {
  const colors = [
    '#F7931A', '#627EEA', '#9945FF', '#2775CA',
    '#00D395', '#FF6B6B', '#4ECDC4', '#FFE66D',
  ];
  const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function addressToInitials(address: string): string {
  return address.slice(2, 4).toUpperCase();
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default async function ProfilePage({ params }: Props) {
  const { address } = params;
  
  // Fetch all data in parallel
  const [stats, history, achievements] = await Promise.all([
    getPlayerStats(address),
    getPortfolioHistory(address),
    getAchievements(address),
  ]);

  const avatarColor = addressToColor(address);
  const initials = addressToInitials(address);

  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Profile Header */}
        <section className="mb-8 rounded-2xl border border-white/5 bg-surface-2 p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            {/* Avatar */}
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-mono text-xl font-bold text-white">
                {shortenAddress(address)}
              </h1>
              <p className="mt-1 text-sm text-white/50">
                {stats?.joinDate 
                  ? `Playing since ${new Date(stats.joinDate).toLocaleDateString()}`
                  : 'New player'
                }
              </p>
              
              {/* Quick Stats Badges */}
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {stats?.totalCompetitions > 0 && (
                  <span className="rounded-full bg-base-blue/10 px-3 py-1 text-xs text-base-blue">
                    {stats.totalCompetitions} competitions
                  </span>
                )}
                {stats?.bestRank && stats.bestRank <= 10 && (
                  <span className="rounded-full bg-accent-amber/10 px-3 py-1 text-xs text-accent-amber">
                    Best: #{stats.bestRank}
                  </span>
                )}
                {stats?.winRate >= 50 && (
                  <span className="rounded-full bg-accent-emerald/10 px-3 py-1 text-xs text-accent-emerald">
                    {stats.winRate}% win rate
                  </span>
                )}
              </div>
            </div>

            {/* Share button */}
            <button className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/60 hover:bg-white/10 transition-colors">
              <svg className="inline h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-white">Statistics</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Competitions"
              value={stats?.totalCompetitions || 0}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatCard
              label="Best Finish"
              value={stats?.bestRank ? `#${stats.bestRank}` : '—'}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              }
            />
            <StatCard
              label="Win Rate"
              value={stats?.winRate ? `${stats.winRate}%` : '—'}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <StatCard
              label="Total Return"
              value={stats?.totalReturn ? `${stats.totalReturn >= 0 ? '+' : ''}${stats.totalReturn.toFixed(1)}%` : '—'}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              trend={stats?.totalReturn ? {
                value: stats.totalReturn,
                isPositive: stats.totalReturn >= 0,
              } : undefined}
            />
          </div>
        </section>

        {/* Performance Chart */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold text-white">Performance</h2>
          <div className="rounded-2xl border border-white/5 bg-surface-2 p-4">
            <PerformanceChart address={address} height={250} />
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Competition History - 2 columns */}
          <section className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-bold text-white">Competition History</h2>
            <PortfolioHistoryList entries={history} />
          </section>

          {/* Achievements - 1 column */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Achievements</h2>
            <AchievementBadges achievements={achievements} />
          </section>
        </div>
      </main>
    </div>
  );
}


