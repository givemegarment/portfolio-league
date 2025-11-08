'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function Nav() {
  return (
    <div className="sticky top-0 z-10 border-b border-neutral-900 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Portfolio League" width={24} height={24} />
          <span className="text-sm font-semibold">Portfolio League</span>
        </Link>
      </div>
    </div>
  )
}
