import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { sendWeeklyDigest, type EmailSubscription } from '@/lib/email';
import { getCurrentWeek } from '@/lib/weeks';

const EMAIL_SUBSCRIPTIONS_KEY = 'email:subscriptions';

// Verify this is called by Vercel Cron
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not set, allowing request');
    return true;
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weekInfo = getCurrentWeek();
    const weekNumber = weekInfo.week;

    // Get all email subscriptions
    const subscriptions = await redis.hgetall(EMAIL_SUBSCRIPTIONS_KEY);
    
    if (!subscriptions || Object.keys(subscriptions).length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No email subscriptions found',
        sent: 0,
      });
    }

    // Fetch leaderboard
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const leaderboardRes = await fetch(`${baseUrl}/api/leaderboard?limit=500`);
    const leaderboard = await leaderboardRes.json();
    
    // Create a map of address -> leaderboard entry
    const leaderboardMap = new Map<string, { rank: number; score: number; allocations: Array<{ symbol: string; percentage: number }> }>();
    for (const entry of leaderboard) {
      leaderboardMap.set(entry.user.toLowerCase(), {
        rank: entry.rank,
        score: entry.score,
        allocations: entry.allocations || [],
      });
    }

    let sent = 0;
    let failed = 0;

    // Send emails to each subscriber
    for (const [address, subscriptionData] of Object.entries(subscriptions)) {
      try {
        const subscription = JSON.parse(subscriptionData as string) as EmailSubscription;
        
        // Skip if user doesn't want weekly digest
        if (!subscription.preferences.weeklyDigest) {
          continue;
        }

        // Get user's leaderboard entry
        const entry = leaderboardMap.get(address.toLowerCase());
        
        if (!entry) {
          // User not on leaderboard, skip
          continue;
        }

        // Send the email
        const result = await sendWeeklyDigest({
          email: subscription.email,
          address: subscription.address,
          rank: entry.rank,
          score: entry.score,
          topAssets: entry.allocations.slice(0, 5),
          weekNumber,
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error sending email to ${address}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Weekly digest sent for Week ${weekNumber}`,
      sent,
      failed,
      total: Object.keys(subscriptions).length,
    });
  } catch (error) {
    console.error('Error sending weekly digest:', error);
    return NextResponse.json(
      { error: 'Failed to send weekly digest' },
      { status: 500 }
    );
  }
}


