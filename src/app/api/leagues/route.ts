import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import {
  League,
  LeagueType,
  CompetitionType,
  createLeague,
  createSampleLeagues,
  getLeagueTypeConfig,
} from '@/lib/competitions';

export const dynamic = 'force-dynamic';

const LEAGUES_KEY = 'leagues:all';
const LEAGUE_KEY_PREFIX = 'league:';
const LEAGUE_MEMBERS_KEY_PREFIX = 'league:members:';

/**
 * GET - Fetch all leagues
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get('type');
    const type: LeagueType | null = typeParam && typeParam !== 'all' ? (typeParam as LeagueType) : null;
    const active = searchParams.get('active') === 'true';
    const featured = searchParams.get('featured') === 'true';

    // Try to fetch from Redis
    let leagues: League[] = [];
    try {
      const leaguesJson = await redis.get<string>(LEAGUES_KEY);
      if (leaguesJson) {
        leagues = JSON.parse(leaguesJson);
      }
    } catch (error) {
      console.error('Error fetching leagues from Redis:', error);
    }

    // Fallback to sample data if no leagues in Redis
    if (leagues.length === 0) {
      leagues = createSampleLeagues();
    }

    // Filter by type
    if (type) {
      leagues = leagues.filter((l) => l.type === type);
    }

    // Filter by active status
    if (active) {
      const now = Date.now();
      leagues = leagues.filter((l) => l.isActive && l.startsAt <= now && l.endsAt >= now);
    }

    // Filter by featured
    if (featured) {
      leagues = leagues.filter((l) => l.isFeatured);
    }

    // Sort by featured first, then by player count
    leagues.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) {
        return a.isFeatured ? -1 : 1;
      }
      return b.playerCount - a.playerCount;
    });

    return NextResponse.json({
      leagues,
      total: leagues.length,
      filters: {
        type,
        active,
        featured,
      },
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new league
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      description,
      createdBy,
      competitionType,
      maxPlayers,
      prizePool,
      entryFee,
      masterAddress,
      narrative,
      riskTier,
    } = body;

    // Validate required fields
    if (!name || !type || !description || !createdBy || !competitionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: LeagueType[] = ['open', 'narrative', 'master-follow', 'risk-tier', 'invite'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid league type' },
        { status: 400 }
      );
    }

    // Validate competition type
    const validCompetitionTypes: CompetitionType[] = ['daily', 'threeDay', 'weekly', 'monthly'];
    if (!validCompetitionTypes.includes(competitionType)) {
      return NextResponse.json(
        { error: 'Invalid competition type' },
        { status: 400 }
      );
    }

    // Create league
    const league = createLeague({
      name,
      type,
      description,
      createdBy,
      competitionType,
      maxPlayers: maxPlayers || 100,
      prizePool: prizePool || 0,
      entryFee: entryFee || 0,
      masterAddress,
      narrative,
      riskTier,
    });

    // Save to Redis
    try {
      const leagueKey = `${LEAGUE_KEY_PREFIX}${league.id}`;
      await redis.set(leagueKey, JSON.stringify(league));

      // Update all leagues list
      const allLeaguesJson = await redis.get<string>(LEAGUES_KEY);
      const allLeagues: League[] = allLeaguesJson ? JSON.parse(allLeaguesJson) : [];
      allLeagues.push(league);
      await redis.set(LEAGUES_KEY, JSON.stringify(allLeagues));
    } catch (error) {
      console.error('Error saving league to Redis:', error);
      // Continue anyway - league is created
    }

    return NextResponse.json({
      success: true,
      league,
    });
  } catch (error) {
    console.error('Error creating league:', error);
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    );
  }
}
