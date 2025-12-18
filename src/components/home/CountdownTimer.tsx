'use client';

import { useState, useEffect } from 'react';

type TimeRemaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
};

function getTimeUntilSundayMidnight(): TimeRemaining {
  const now = new Date();
  
  // Get the end of the current week (Sunday 23:59:59 UTC)
  const dayOfWeek = now.getUTCDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  
  const endOfWeek = new Date(now);
  endOfWeek.setUTCDate(now.getUTCDate() + daysUntilSunday);
  endOfWeek.setUTCHours(23, 59, 59, 999);
  
  const totalMs = Math.max(0, endOfWeek.getTime() - now.getTime());
  
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, totalMs };
}

function TimeUnit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl font-mono text-2xl sm:text-3xl font-bold transition-colors ${
          urgent 
            ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30' 
            : 'bg-white/5 text-white border border-white/10'
        }`}
      >
        {value.toString().padStart(2, '0')}
      </div>
      <span className={`mt-1.5 text-xs font-medium uppercase tracking-wider ${urgent ? 'text-accent-rose/70' : 'text-white/40'}`}>
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeRemaining(getTimeUntilSundayMidnight());

    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilSundayMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted || !timeRemaining) {
    return (
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl shimmer" />
            <div className="mt-1.5 h-3 w-8 rounded shimmer" />
          </div>
        ))}
      </div>
    );
  }

  // Urgent if less than 24 hours remaining
  const isUrgent = timeRemaining.days === 0 && timeRemaining.hours < 24;
  // Critical if less than 1 hour
  const isCritical = timeRemaining.days === 0 && timeRemaining.hours === 0;

  return (
    <div className="rounded-2xl border border-white/5 bg-surface-2/50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Label */}
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isUrgent ? 'bg-accent-rose/20' : 'bg-base-blue/20'
          }`}>
            <svg 
              className={`h-5 w-5 ${isUrgent ? 'text-accent-rose' : 'text-base-blue'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <div>
            <p className={`text-sm font-semibold ${isUrgent ? 'text-accent-rose' : 'text-white'}`}>
              {isCritical ? '⚠️ Picks Lock Soon!' : isUrgent ? 'Last Chance!' : 'Time Until Picks Lock'}
            </p>
            <p className="text-xs text-white/40">Sunday 23:59 UTC</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <TimeUnit value={timeRemaining.days} label="Days" urgent={isUrgent} />
          <span className={`text-2xl font-bold ${isUrgent ? 'text-accent-rose/50' : 'text-white/20'}`}>:</span>
          <TimeUnit value={timeRemaining.hours} label="Hrs" urgent={isUrgent} />
          <span className={`text-2xl font-bold ${isUrgent ? 'text-accent-rose/50' : 'text-white/20'}`}>:</span>
          <TimeUnit value={timeRemaining.minutes} label="Min" urgent={isUrgent} />
          <span className={`text-2xl font-bold ${isUrgent ? 'text-accent-rose/50' : 'text-white/20'}`}>:</span>
          <TimeUnit value={timeRemaining.seconds} label="Sec" urgent={isUrgent} />
        </div>
      </div>

      {/* Urgency message */}
      {isUrgent && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent-rose/10 px-4 py-2 border border-accent-rose/20">
          <svg className="h-4 w-4 text-accent-rose animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-accent-rose">
            {isCritical 
              ? 'Less than an hour left! Submit your picks now!' 
              : 'Less than 24 hours remaining. Don\'t miss out!'}
          </span>
        </div>
      )}
    </div>
  );
}







