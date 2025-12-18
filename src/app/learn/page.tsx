import Nav from '@/components/chrome/Nav';
import Link from 'next/link';

type LessonCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
};

const lessons: LessonCard[] = [
  {
    id: 'intro-imitatio',
    title: 'Introduction to Imitatio',
    description: 'Learn the basics of portfolio strategy through emulation',
    icon: '📚',
    category: 'Getting Started',
    duration: '5 min',
    difficulty: 'beginner',
  },
  {
    id: 'understanding-masters',
    title: 'Understanding Masters',
    description: 'How to analyze and learn from high-performing wallets',
    icon: '👑',
    category: 'Masters',
    duration: '8 min',
    difficulty: 'beginner',
  },
  {
    id: 'portfolio-allocation',
    title: 'Portfolio Allocation Basics',
    description: 'Learn how to distribute your assets effectively',
    icon: '📊',
    category: 'Strategy',
    duration: '10 min',
    difficulty: 'beginner',
  },
  {
    id: 'risk-management',
    title: 'Risk Management 101',
    description: 'Understanding volatility, drawdown, and diversification',
    icon: '🛡️',
    category: 'Risk',
    duration: '12 min',
    difficulty: 'intermediate',
  },
  {
    id: 'reading-sharpe-ratio',
    title: 'Reading Sharpe Ratio',
    description: 'How to evaluate risk-adjusted returns',
    icon: '📈',
    category: 'Metrics',
    duration: '7 min',
    difficulty: 'intermediate',
  },
  {
    id: 'narrative-trading',
    title: 'Narrative-Based Trading',
    description: 'Identify and ride DeFi narratives for profit',
    icon: '📖',
    category: 'Strategy',
    duration: '15 min',
    difficulty: 'intermediate',
  },
  {
    id: 'emulation-strategies',
    title: 'Advanced Emulation Strategies',
    description: 'When to mirror vs. when to deviate from Masters',
    icon: '🎯',
    category: 'Masters',
    duration: '12 min',
    difficulty: 'advanced',
  },
  {
    id: 'portfolio-correlation',
    title: 'Portfolio Correlation Analysis',
    description: 'Build portfolios that truly diversify risk',
    icon: '🔗',
    category: 'Risk',
    duration: '10 min',
    difficulty: 'advanced',
  },
];

const strategyPatterns = [
  {
    name: 'Blue Chip Core',
    description: 'Heavy allocation to BTC/ETH with small alt positions',
    riskLevel: 'Conservative',
    color: '#10B981',
    example: '50% BTC, 30% ETH, 20% Alts',
  },
  {
    name: 'DeFi Yield',
    description: 'Focus on yield-generating DeFi tokens',
    riskLevel: 'Moderate',
    color: '#F59E0B',
    example: '30% ETH, 25% AAVE, 25% UNI, 20% CRV',
  },
  {
    name: 'Memecoin Degen',
    description: 'High-risk memecoin plays for maximum gains',
    riskLevel: 'Extreme',
    color: '#EF4444',
    example: '40% PEPE, 30% WIF, 30% BONK',
  },
  {
    name: 'L2 Ecosystem',
    description: 'Bet on Layer 2 scaling solutions',
    riskLevel: 'Moderate',
    color: '#0052FF',
    example: '30% OP, 30% ARB, 25% AERO, 15% POL',
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      <Nav />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-amber/10 px-4 py-2">
            <span className="text-lg">📚</span>
            <span className="text-sm font-medium text-accent-amber">
              Learning Center
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Master the Art of Portfolio Strategy
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">
            Learn from the best, understand risk, and develop your own winning
            strategies through our comprehensive learning resources.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          <QuickLink
            href="/how-to-play"
            icon="🎮"
            title="How to Play"
            description="Get started with the basics"
          />
          <QuickLink
            href="/masters"
            icon="👑"
            title="Browse Masters"
            description="Find strategies to emulate"
          />
          <QuickLink
            href="/faq"
            icon="❓"
            title="FAQ"
            description="Common questions answered"
          />
        </div>

        {/* Lessons Grid */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Lessons</h2>
            <div className="flex gap-2">
              <span className="rounded-full bg-accent-emerald/20 px-2 py-1 text-xs text-accent-emerald">
                Beginner
              </span>
              <span className="rounded-full bg-accent-amber/20 px-2 py-1 text-xs text-accent-amber">
                Intermediate
              </span>
              <span className="rounded-full bg-accent-rose/20 px-2 py-1 text-xs text-accent-rose">
                Advanced
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCardComponent key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </section>

        {/* Strategy Patterns */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Common Strategy Patterns
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {strategyPatterns.map((pattern) => (
              <StrategyPatternCard key={pattern.name} pattern={pattern} />
            ))}
          </div>
        </section>

        {/* Key Metrics Explained */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Key Metrics Explained
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricExplainer
              name="Sharpe Ratio"
              description="Measures risk-adjusted returns. Higher is better. Above 1 is good, above 2 is excellent."
              formula="(Return - Risk-Free Rate) / Volatility"
              icon="📊"
            />
            <MetricExplainer
              name="Max Drawdown"
              description="The largest peak-to-trough decline. Shows worst-case loss scenario."
              formula="(Peak - Trough) / Peak × 100"
              icon="📉"
            />
            <MetricExplainer
              name="Volatility"
              description="How much returns vary. Higher volatility means more risk and potential reward."
              formula="Standard deviation of returns"
              icon="📈"
            />
            <MetricExplainer
              name="Win Rate"
              description="Percentage of positions that resulted in profit."
              formula="Winning Trades / Total Trades × 100"
              icon="✅"
            />
            <MetricExplainer
              name="Diversification Score"
              description="How spread out your allocation is. Higher means more diversified."
              formula="Based on HHI (Herfindahl Index)"
              icon="🎯"
            />
            <MetricExplainer
              name="Adaptation Score"
              description="How closely your portfolio matches a Master's strategy."
              formula="Cosine similarity of allocations"
              icon="🔄"
            />
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl border border-base-blue/20 bg-gradient-to-br from-base-blue/10 to-purple-600/10 p-8 text-center">
          <h2 className="text-2xl font-bold text-white">
            Ready to Put Your Knowledge to the Test?
          </h2>
          <p className="mt-2 text-white/60">
            Start building your portfolio and compete with others
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/" className="btn-primary">
              Build Portfolio
            </Link>
            <Link href="/masters" className="btn-secondary">
              Find a Master
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-surface-2 p-6 transition-all hover:border-white/10 hover:bg-surface-3"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl group-hover:bg-base-blue/20">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="text-sm text-white/50">{description}</p>
      </div>
    </Link>
  );
}

function LessonCardComponent({ lesson }: { lesson: LessonCard }) {
  const difficultyColors = {
    beginner: 'text-accent-emerald bg-accent-emerald/20',
    intermediate: 'text-accent-amber bg-accent-amber/20',
    advanced: 'text-accent-rose bg-accent-rose/20',
  };

  return (
    <div className="group rounded-2xl border border-white/5 bg-surface-2 p-6 transition-all hover:border-white/10 hover:bg-surface-3 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-2xl group-hover:bg-base-blue/20">
          {lesson.icon}
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            difficultyColors[lesson.difficulty]
          }`}
        >
          {lesson.difficulty}
        </span>
      </div>
      <h3 className="mt-4 font-bold text-white">{lesson.title}</h3>
      <p className="mt-1 text-sm text-white/50">{lesson.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <span>{lesson.category}</span>
        <span>{lesson.duration}</span>
      </div>
    </div>
  );
}

function StrategyPatternCard({
  pattern,
}: {
  pattern: (typeof strategyPatterns)[0];
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white">{pattern.name}</h3>
        <span
          className="rounded-full px-2 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${pattern.color}20`,
            color: pattern.color,
          }}
        >
          {pattern.riskLevel}
        </span>
      </div>
      <p className="mt-2 text-sm text-white/50">{pattern.description}</p>
      <div className="mt-4 rounded-lg bg-white/5 p-3 font-mono text-sm text-white/60">
        {pattern.example}
      </div>
    </div>
  );
}

function MetricExplainer({
  name,
  description,
  formula,
  icon,
}: {
  name: string;
  description: string;
  formula: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2 p-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold text-white">{name}</h3>
      </div>
      <p className="mt-3 text-sm text-white/50">{description}</p>
      <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs font-mono text-white/40">
        {formula}
      </div>
    </div>
  );
}




