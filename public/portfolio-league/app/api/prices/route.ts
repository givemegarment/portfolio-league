import { NextResponse } from 'next/server';
import { Asset, PriceData } from '@/app/types';

// Mock price data - in production, fetch from Chainlink oracles or Coinbase API
const getMockPrice = (asset: Asset): PriceData => {
  const prices = {
    BTC: {
      asset: 'BTC' as Asset,
      price: 95000 + Math.random() * 1000,
      timestamp: Date.now(),
      change24h: Math.random() * 10 - 2,
    },
    ETH: {
      asset: 'ETH' as Asset,
      price: 3500 + Math.random() * 100,
      timestamp: Date.now(),
      change24h: Math.random() * 10 - 2,
    },
    SOL: {
      asset: 'SOL' as Asset,
      price: 140 + Math.random() * 10,
      timestamp: Date.now(),
      change24h: Math.random() * 15 - 5,
    },
    USDC_YIELD: {
      asset: 'USDC_YIELD' as Asset,
      price: 4.5 + Math.random() * 0.5, // APY percentage
      timestamp: Date.now(),
      change24h: Math.random() * 0.2 - 0.1,
    },
  };

  return prices[asset];
};

export async function GET() {
  try {
    const prices = {
      BTC: getMockPrice('BTC'),
      ETH: getMockPrice('ETH'),
      SOL: getMockPrice('SOL'),
      USDC_YIELD: getMockPrice('USDC_YIELD'),
    };

    return NextResponse.json(prices);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
