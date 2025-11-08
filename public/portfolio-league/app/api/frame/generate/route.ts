import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { address, assets, allocations, season } = body;

    // Generate shareable card image URL
    const imageUrl = `https://portfolio-league.base.org/api/og?address=${address}&season=${season}&assets=${assets.join(',')}&allocations=${allocations.join(',')}`;

    // Farcaster Frame metadata
    const frame = {
      version: 'vNext',
      image: imageUrl,
      buttons: [
        {
          label: '🏆 Join League',
          action: 'link',
          target: 'https://portfolio-league.base.org',
        },
        {
          label: '📊 View Leaderboard',
          action: 'link',
          target: `https://portfolio-league.base.org?season=${season}`,
        },
        {
          label: '🔗 Share',
          action: 'post',
        },
      ],
      postUrl: `https://portfolio-league.base.org/api/frame/action`,
    };

    // Generate Farcaster cast text
    const castText = `Just entered Portfolio League Season ${season}! 🏆\n\nMy portfolio:\n${assets.map((a: string, i: number) => `${a}: ${allocations[i]}%`).join('\n')}\n\nThink you can beat me? Join now! 👇`;

    return NextResponse.json({
      success: true,
      frame,
      castText,
      imageUrl,
    });
  } catch (error) {
    console.error('Frame generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate frame' },
      { status: 500 }
    );
  }
}

// Frame action handler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'share') {
      // Handle share action
      return NextResponse.json({
        message: 'Frame shared successfully!',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Frame action failed' },
      { status: 500 }
    );
  }
}
