export const dynamic = 'force-dynamic';
import NextDynamic from 'next/dynamic';

const HomeClient = NextDynamic(() => import('./home-client'), { ssr: false });

export default function Page() {
  return <HomeClient />;
}
