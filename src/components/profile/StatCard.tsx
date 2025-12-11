'use client';

type Props = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

export default function StatCard({ label, value, icon, trend, className = '' }: Props) {
  return (
    <div className={`rounded-xl border border-white/5 bg-white/[0.02] p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`mt-1 flex items-center gap-1 text-xs ${
              trend.isPositive ? 'text-accent-emerald' : 'text-accent-rose'
            }`}>
              <svg 
                className={`h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-base-blue/10 text-base-blue">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}



