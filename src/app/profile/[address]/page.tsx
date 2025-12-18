'use client';

import { useParams } from 'next/navigation';
import Nav from '@/components/chrome/Nav';

export default function ProfilePage() {
  const params = useParams();
  const address = params.address as string;

  if (!address) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
          <div className="text-center text-white/50">Invalid address</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Profile</h1>
          <div className="font-mono text-sm text-white/60">{address}</div>
        </div>
      </main>
    </div>
  );
}
