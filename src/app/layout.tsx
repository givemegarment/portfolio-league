import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const Providers = dynamic(() => import('@/components/Providers'), { ssr: false })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imitatio.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Imitatio | Master Portfolio Strategy',
  description: 'Master the art of portfolio strategy. Emulate the best traders, compete weekly, win prizes. The ultimate on-chain portfolio game on Base.',
  openGraph: { 
    title: 'Imitatio', 
    description: 'Master portfolio strategy. Emulate the best, compete weekly, win prizes on Base.', 
    images: [{ url: '/api/og/home', width: 1200, height: 630, alt: 'Imitatio' }], 
    type: 'website',
    siteName: 'Imitatio',
  },
  twitter: { 
    card: 'summary_large_image', 
    title: 'Imitatio', 
    description: 'Master portfolio strategy. Emulate the best, compete weekly, win prizes on Base.', 
    images: ['/api/og/home'],
    site: '@imitatio_app',
  },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
  // Farcaster Frame meta tags for embed preview
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': `${SITE}/api/og/home`,
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': '🏆 View Leaderboard',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': `${SITE}`,
    'fc:frame:button:2': '🎯 Join Competition',
    'fc:frame:button:2:action': 'link',
    'fc:frame:button:2:target': `${SITE}`,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} bg-[#050507]`}>
      <body className="min-h-screen text-white antialiased font-sans">
        {/* Background gradient mesh */}
        <div 
          className="fixed inset-0 -z-10 bg-gradient-mesh opacity-60"
          aria-hidden="true"
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
