'use client';

import { useParams } from 'next/navigation';
import Nav from '@/components/chrome/Nav';
import UserProfile from '@/components/profile/UserProfile';

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
        <UserProfile address={address} />
        
        {/* Back to main */}
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="inline-flex items-center gap-2 text-base-blue hover:text-base-blue-light transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Imitatio
          </a>
        </div>
      </main>
    </div>
  );
}
