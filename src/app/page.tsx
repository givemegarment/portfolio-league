import { Metadata } from 'next';
export const dynamic = 'force-dynamic';
import NextDynamic from 'next/dynamic';

export const metadata: Metadata = {
  other: {
    'base:app_id': '6943dcf2d19763ca26ddc3fb',
  },
};

const HomeClient = NextDynamic(() => import('./home-client'), { ssr: false });

export default function Page() {
  return <HomeClient />;
}
