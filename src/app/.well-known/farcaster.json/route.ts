import { NextResponse } from 'next/server';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolio-league.vercel.app';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwIn0",
      payload: "eyJkb21haW4iOiJwb3J0Zm9saW8tbGVhZ3VlLnZlcmNlbC5hcHAifQ",
      signature: "MHgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA"
    },
    frame: {
      version: "1",
      name: "Portfolio League",
      iconUrl: `${siteUrl}/icon-512.png`,
      splashImageUrl: `${siteUrl}/splash.png`,
      splashBackgroundColor: "#050507",
      homeUrl: siteUrl,
      webhookUrl: `${siteUrl}/api/webhook`
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

