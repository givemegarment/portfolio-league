import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'

const Providers = dynamic(() => import('@/components/Providers'), { ssr: false })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-league.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Portfolio League',
  description: 'Pick 3 assets. Weekly leagues. On-chain scores.',
  openGraph: { title: 'Portfolio League', description: 'Pick 3 assets. Weekly leagues. On-chain scores.', images: ['/og.svg'], type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Portfolio League', description: 'Pick 3 assets. Weekly leagues. On-chain scores.', images: ['/og.svg'] },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
