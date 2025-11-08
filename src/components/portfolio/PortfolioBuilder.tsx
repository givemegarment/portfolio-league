/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'

type Asset = { id: 'BTC' | 'ETH' | 'SOL' | 'USDC'; label: string }
const ASSETS: Asset[] = [
  { id: 'BTC',  label: 'BTC' },
  { id: 'ETH',  label: 'ETH' },
  { id: 'SOL',  label: 'SOL' },
  { id: 'USDC', label: 'USDC Yield' },
]

export default function PortfolioBuilder({ address }: { address?: string }) {
  const [selected, setSelected] = useState<Asset[]>([])
  const [busy, setBusy] = useState(false)

  const toggle = (a: Asset) => {
    const exists = selected.find(s => s.id === a.id)
    if (exists) setSelected(prev => prev.filter(s => s.id !== a.id))
    else if (selected.length < 3) setSelected(prev => [...prev, a])
  }

  const submit = async () => {
    if (selected.length !== 3 || busy) return
    setBusy(true)
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, basket: selected.map(s => s.id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'submit failed')
      alert(`Submitted! Score: ${data.score}`)
      // обновим таблицу лидеров
      window.dispatchEvent(new Event('refresh-leaderboard'))
    } catch (e:any) {
      alert(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Pick 3 assets</h2>
      <div className="grid grid-cols-2 gap-3">
        {ASSETS.map(a => {
          const isSel = !!selected.find(s => s.id === a.id)
          const disabled = !isSel && selected.length >= 3
          return (
            <button
              key={a.id}
              onClick={() => toggle(a)}
              disabled={disabled}
              className={`border rounded px-4 py-3 text-left
                ${isSel ? 'bg-white text-black' : 'bg-transparent text-white'}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10'}`}
            >
              {a.label}
            </button>
          )
        })}
      </div>

      <div className="mt-4 text-sm opacity-80">
        Selected: {selected.map(s => s.id).join(' / ') || '—'}
      </div>

      <button
        onClick={submit}
        disabled={selected.length !== 3 || busy}
        className="mt-4 border rounded px-4 py-2 disabled:opacity-40"
      >
        {busy ? 'Submitting…' : 'Submit portfolio'}
      </button>
    </section>
  )
}
