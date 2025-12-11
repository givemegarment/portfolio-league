import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
})

const Providers = dynamic(() => import('@/components/Providers'), { ssr: false })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-league.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Imitatio | Master the Art of Strategy Emulation',
  description: 'Study top traders. Build your strategy. Compete in Chambers. The ultimate social crypto portfolio game on Base.',
  openGraph: { 
    title: 'Imitatio', 
    description: 'Study top traders. Build your strategy. Compete in Chambers on Base.', 
    images: [{ url: '/api/og/home', width: 1200, height: 630, alt: 'Imitatio' }], 
    type: 'website',
    siteName: 'Imitatio',
  },
  twitter: { 
    card: 'summary_large_image', 
    title: 'Imitatio', 
    description: 'Study top traders. Build your strategy. Compete in Chambers on Base.', 
    images: ['/api/og/home'],
    site: '@imitatio',
  },
  icons: { 
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/icon.svg',
  },
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
    <html lang="en" className={`bg-[#050507] ${outfit.variable} ${jetbrainsMono.variable}`}>
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
