import { NextResponse } from 'next/server';
import { minikitConfig } from '../../../../minikit.config';

export async function GET() {
  const manifest = {
    accountAssociation: minikitConfig.accountAssociation,
    frame: {
      version: minikitConfig.miniapp.version,
      name: minikitConfig.miniapp.name,
      iconUrl: minikitConfig.miniapp.iconUrl,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      homeUrl: minikitConfig.miniapp.homeUrl,
      webhookUrl: minikitConfig.miniapp.webhookUrl,
    },
  };

  return NextResponse.json(manifest, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
