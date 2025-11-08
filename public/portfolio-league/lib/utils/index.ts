import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function calculatePortfolioReturn(
  startPrices: Record<string, number>,
  currentPrices: Record<string, number>,
  assets: string[]
): number {
  let totalReturn = 0;
  const weight = 1 / assets.length; // Equal weight

  assets.forEach((asset) => {
    const startPrice = startPrices[asset] || 0;
    const currentPrice = currentPrices[asset] || 0;
    const assetReturn = ((currentPrice - startPrice) / startPrice) * 100;
    totalReturn += assetReturn * weight;
  });

  return totalReturn;
}

export function getWeekStartTimestamp(): number {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return Math.floor(monday.getTime() / 1000);
}

export function getWeekEndTimestamp(): number {
  const start = getWeekStartTimestamp();
  return start + 7 * 24 * 60 * 60; // Add 7 days
}
