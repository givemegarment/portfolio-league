import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Chainlink Price Feed ABI (simplified)
const PRICE_FEED_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
];

// Price feed addresses on Base
const PRICE_FEEDS = {
  BTC: process.env.NEXT_PUBLIC_CHAINLINK_BTC_USD || '0x64c911996D3c6aC71f9b455B1E8E7266BcbD848F',
  ETH: process.env.NEXT_PUBLIC_CHAINLINK_ETH_USD || '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
  SOL: process.env.NEXT_PUBLIC_CHAINLINK_SOL_USD || '', // Add when available
};

async function getPrice(feedAddress: string): Promise<number> {
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const priceFeed = new ethers.Contract(feedAddress, PRICE_FEED_ABI, provider);
    const roundData = await priceFeed.latestRoundData();
    
    // Price feeds typically have 8 decimals
    const price = Number(roundData.answer) / 1e8;
    return price;
  } catch (error) {
    console.error(`Error fetching price from ${feedAddress}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const prices: Record<string, number> = {};

    // Fetch BTC price
    if (PRICE_FEEDS.BTC) {
      prices.BTC = await getPrice(PRICE_FEEDS.BTC);
    }

    // Fetch ETH price
    if (PRICE_FEEDS.ETH) {
      prices.ETH = await getPrice(PRICE_FEEDS.ETH);
    }

    // Fetch SOL price (when available)
    if (PRICE_FEEDS.SOL) {
      prices.SOL = await getPrice(PRICE_FEEDS.SOL);
    } else {
      // Fallback to API or mock data
      prices.SOL = 150.0; // Mock price for demo
    }

    // USDC is stablecoin, always $1
    prices.USDC = 1.0;

    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching oracle prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}
