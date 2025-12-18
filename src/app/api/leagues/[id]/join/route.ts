import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { League } from '@/lib/competitions';

export const dynamic = 'force-dynamic';

const LEAGUE_KEY_PREFIX = 'league:';
const LEAGUE_MEMBERS_KEY_PREFIX = 'league:members:';
const LEAGUES_KEY = 'leagues:all';

/**
 * POST - Join a league
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id;
    const body = await request.json();
    const { address, inviteCode } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address required' },
        { status: 400 }
      );
    }

    // Fetch league
    const leagueKey = `${LEAGUE_KEY_PREFIX}${leagueId}`;
    const leagueJson = await redis.get<string>(leagueKey);
    
    if (!leagueJson) {
      return NextResponse.json(
        { error: 'League not found' },
        { status: 404 }
      );
    }

    const league: League = JSON.parse(leagueJson);

    // Check if league is active
    const now = Date.now();
    if (!league.isActive || now < league.startsAt || now > league.endsAt) {
      return NextResponse.json(
        { error: 'League is not currently active' },
        { status: 400 }
      );
    }

    // Check if league is full
    if (league.playerCount >= league.maxPlayers) {
      return NextResponse.json(
        { error: 'League is full' },
        { status: 400 }
      );
    }

    // Check invite code for private leagues
    if (league.type === 'invite') {
      if (!inviteCode || inviteCode !== league.inviteCode) {
        return NextResponse.json(
          { error: 'Invalid invite code' },
          { status: 403 }
        );
      }
    }

    // Check if user is already a member
    const membersKey = `${LEAGUE_MEMBERS_KEY_PREFIX}${leagueId}`;
    const isMember = await redis.sismember(membersKey, address.toLowerCase());
    
    if (isMember === 1) {
      return NextResponse.json(
        { error: 'Already a member of this league' },
        { status: 400 }
      );
    }

    // Add user to league
    await redis.sadd(membersKey, address.toLowerCase());

    // Update league player count
    league.playerCount += 1;
    await redis.set(leagueKey, JSON.stringify(league));

    // Update in all leagues list
    const allLeaguesJson = await redis.get<string>(LEAGUES_KEY);
    if (allLeaguesJson) {
      const allLeagues: League[] = JSON.parse(allLeaguesJson);
      const index = allLeagues.findIndex((l) => l.id === leagueId);
      if (index >= 0) {
        allLeagues[index] = league;
        await redis.set(LEAGUES_KEY, JSON.stringify(allLeagues));
      }
    }

    return NextResponse.json({
      success: true,
      league,
      message: 'Successfully joined league',
    });
  } catch (error) {
    console.error('Error joining league:', error);
    return NextResponse.json(
      { error: 'Failed to join league' },
      { status: 500 }
    );
  }
}

/**
 * GET - Check if user is a member of the league
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leagueId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address required' },
        { status: 400 }
      );
    }

    const membersKey = `${LEAGUE_MEMBERS_KEY_PREFIX}${leagueId}`;
    const isMember = await redis.sismember(membersKey, address.toLowerCase());

    return NextResponse.json({
      isMember: isMember === 1,
    });
  } catch (error) {
    console.error('Error checking league membership:', error);
    return NextResponse.json(
      { error: 'Failed to check membership' },
      { status: 500 }
    );
  }
}
