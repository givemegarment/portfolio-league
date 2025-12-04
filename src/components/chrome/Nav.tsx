'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Calculate time until next Sunday 11:59 PM UTC
      const now = new Date();
      const nextSunday = new Date(now);
      nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()));
      nextSunday.setUTCHours(23, 59, 59, 999);
      
      const diff = nextSunday.getTime() - now.getTime();
      
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <svg className="h-3.5 w-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-white/40">Locks in</span>
      <span className="font-mono font-medium text-white">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'border-b border-white/5 bg-[#050507]/90 backdrop-blur-xl' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-base-blue to-purple-600 opacity-0 blur transition-opacity duration-300 group-hover:opacity-50" />
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-base-blue to-purple-600">
              <Image src="/logo.svg" alt="Portfolio League" width={24} height={24} className="brightness-0 invert" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-white">Portfolio League</div>
            <div className="text-xs text-white/40">Season 1 • Week 4</div>
          </div>
        </Link>

        {/* Center - Timer (hidden on mobile) */}
        <div className="hidden md:block">
          <CountdownTimer />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Prize Pool Badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-accent-emerald/10 px-3 py-1.5 border border-accent-emerald/20">
            <div className="h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs font-medium text-accent-emerald">$1,000 Prize Pool</span>
          </div>
          
          {/* Wallet Connect Button placeholder */}
          <button className="btn-primary py-2 px-4 text-sm">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="hidden sm:inline">Connect</span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile timer bar */}
      <div className="border-t border-white/5 px-4 py-2 md:hidden">
        <CountdownTimer />
      </div>
    </nav>
  )
}
