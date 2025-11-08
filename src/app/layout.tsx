import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Portfolio League',
  description: 'Pick 3 assets. Weekly leagues. On-chain scores.',
  openGraph: {
    title: 'Portfolio League',
    description: 'Pick 3 assets. Weekly leagues. On-chain scores.',
    images: ['/og.svg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio League',
    description: 'Pick 3 assets. Weekly leagues. On-chain scores.',
    images: ['/og.svg'],
  },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className="text-white antialiased">{children}</body>
    </html>
  )
}
