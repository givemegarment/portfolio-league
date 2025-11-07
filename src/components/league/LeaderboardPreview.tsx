'use client'
import { useEffect, useState } from 'react'

type Row = { rank:number; user:string; score:number; basket:string }

export default function LeaderboardPreview() {
  const [rows, setRows] = useState<Row[]>([])

  const load = async () => {
    const r = await fetch('/api/leaderboard', { cache: 'no-store' })
    const d = await r.json()
    setRows(d.rows ?? [])
  }

  useEffect(() => {
    load()
    const h = () => load()
    window.addEventListener('refresh-leaderboard', h)
    return () => window.removeEventListener('refresh-leaderboard', h)
  }, [])

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">User</th>
              <th className="text-right p-2">Score</th>
              <th className="text-left p-2">Basket</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.rank} className="border-t border-white/10">
                <td className="p-2">{r.rank}</td>
                <td className="p-2">{r.user}</td>
                <td className="p-2 text-right">{r.score.toFixed(1)}</td>
                <td className="p-2">{r.basket}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-3" colSpan={4}>No entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
