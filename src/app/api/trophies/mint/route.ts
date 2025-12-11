import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { 
  TROPHY_CONTRACT_ADDRESS, 
  TROPHY_CONTRACT_ABI, 
  TrophyType,
  achievementToTrophyType,
  toContractScore,
} from '@/lib/contracts/trophies';

// Check if we have the minter private key configured
const MINTER_PRIVATE_KEY = process.env.TROPHY_MINTER_PRIVATE_KEY;
const isConfigured = MINTER_PRIVATE_KEY && TROPHY_CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';

type MintRequest = {
  player: string;
  achievementType: string;
  season: number;
  week: number;
  score: number;
};

/**
 * POST - Mint a trophy NFT for a player
 * 
 * This endpoint should be called by authorized services (e.g., cron job at week end)
 * In production, add proper authentication
 */
export async function POST(req: NextRequest) {
  // Check if contract is deployed and configured
  if (!isConfigured) {
    return NextResponse.json({
      error: 'Trophy minting not configured',
      message: 'Contract not deployed or minter key not set',
      hint: 'Deploy contract to Base and set TROPHY_MINTER_PRIVATE_KEY env var',
    }, { status: 503 });
  }

  try {
    const body: MintRequest = await req.json();
    const { player, achievementType, season, week, score } = body;

    // Validate input
    if (!player || !achievementType || season === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert achievement type to trophy type
    const trophyType = achievementToTrophyType(achievementType);
    if (trophyType === null) {
      return NextResponse.json({ error: 'Invalid achievement type' }, { status: 400 });
    }

    // Create clients
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    const account = privateKeyToAccount(MINTER_PRIVATE_KEY as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: base,
      transport: http(),
    });

    // Check if player already has this achievement
    const hasAchievement = await publicClient.readContract({
      address: TROPHY_CONTRACT_ADDRESS,
      abi: TROPHY_CONTRACT_ABI,
      functionName: 'hasAchievement',
      args: [player as Address, trophyType, BigInt(season), BigInt(week || 0)],
    });

    if (hasAchievement) {
      return NextResponse.json({ 
        error: 'Achievement already awarded',
        alreadyMinted: true,
      }, { status: 400 });
    }

    // Mint the trophy
    const hash = await walletClient.writeContract({
      address: TROPHY_CONTRACT_ADDRESS,
      abi: TROPHY_CONTRACT_ABI,
      functionName: 'awardTrophy',
      args: [
        player as Address,
        trophyType,
        BigInt(season),
        BigInt(week || 0),
        toContractScore(score || 0),
      ],
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      ok: true,
      transactionHash: hash,
      blockNumber: Number(receipt.blockNumber),
      player,
      trophyType,
      season,
      week,
    });
  } catch (error) {
    console.error('Trophy minting error:', error);
    return NextResponse.json({
      error: 'Failed to mint trophy',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET - Check trophy minting status and contract info
 */
export async function GET() {
  if (!isConfigured) {
    return NextResponse.json({
      configured: false,
      contractAddress: TROPHY_CONTRACT_ADDRESS,
      message: 'Trophy contract not deployed or minter not configured',
    });
  }

  try {
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Get total supply
    const totalSupply = await publicClient.readContract({
      address: TROPHY_CONTRACT_ADDRESS,
      abi: TROPHY_CONTRACT_ABI,
      functionName: 'totalSupply',
    });

    return NextResponse.json({
      configured: true,
      contractAddress: TROPHY_CONTRACT_ADDRESS,
      chain: 'base',
      totalTrophiesMinted: Number(totalSupply),
    });
  } catch (error) {
    return NextResponse.json({
      configured: true,
      contractAddress: TROPHY_CONTRACT_ADDRESS,
      error: 'Failed to read contract',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}





