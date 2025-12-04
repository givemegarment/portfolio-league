import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import './globals.css'

const Providers = dynamic(() => import('@/components/Providers'), { ssr: false })

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio-league.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'Portfolio League | Crypto Portfolio Competition',
  description: 'Pick 3 assets. Compete weekly. Win prizes. The ultimate social crypto portfolio game on Base.',
  openGraph: { 
    title: 'Portfolio League', 
    description: 'Pick 3 assets. Compete weekly. Win prizes on Base.', 
    images: ['/og.svg'], 
    type: 'website' 
  },
  twitter: { 
    card: 'summary_large_image', 
    title: 'Portfolio League', 
    description: 'Pick 3 assets. Compete weekly. Win prizes on Base.', 
    images: ['/og.svg'] 
  },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#050507]">
      <body className="min-h-screen text-white antialiased">
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
