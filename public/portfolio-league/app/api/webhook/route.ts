import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    console.log('Received webhook event:', event, data);

    switch (event) {
      case 'frame_added':
        // User added the mini app to their wallet
        console.log('Frame added by user:', data.fid);
        break;

      case 'frame_removed':
        // User removed the mini app
        console.log('Frame removed by user:', data.fid);
        break;

      case 'notifications_enabled':
        // User enabled notifications
        console.log('Notifications enabled for:', data.fid);
        break;

      case 'notifications_disabled':
        // User disabled notifications
        console.log('Notifications disabled for:', data.fid);
        break;

      default:
        console.log('Unknown event:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
