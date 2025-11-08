'use client';

import { useEffect, useState } from 'react';

type Row = { rank: number; user: string; score: number; basket: string };

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="py-2"><div className="h-4 w-4 rounded bg-neutral-800" /></td>
      <td className="py-2"><div className="h-4 w-40 rounded bg-neutral-800" /></td>
      <td className="py-2"><div className="h-4 w-12 rounded bg-neutral-800" /></td>
      <td className="py-2"><div className="h-4 w-32 rounded bg-neutral-800" /></td>
    </tr>
  );
}

export default function LeaderboardPreview() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data: Row[]) => {
        if (alive) setRows(Array.isArray(data) ? data : []);
      })
      .catch(() => setErr('Failed to load leaderboard'));
    return () => { alive = false; };
  }, []);

  if (err) return <div className="text-sm text-red-400">{err}</div>;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800">
      <table className="w-full text-sm">
        <thead className="bg-neutral-900 text-neutral-300">
          <tr>
            <th className="px-3 py-2 text-left">#</th>
            <th className="px-3 py-2 text-left">User</th>
            <th className="px-3 py-2 text-left">Score</th>
            <th className="px-3 py-2 text-left">Basket</th>
          </tr>
        </thead>
        <tbody className="bg-neutral-950">
          {rows === null && (<><SkeletonRow /><SkeletonRow /><SkeletonRow /></>)}
          {rows !== null && rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-neutral-400">
                No entries yet — be the first to submit your picks.
              </td>
            </tr>
          )}
          {rows?.map((r) => {
            let assets: string[] = [];
            try { assets = JSON.parse(r.basket); } catch {}
            return (
              <tr key={r.rank} className="border-t border-neutral-900">
                <td className="px-3 py-2">{r.rank}</td>
                <td className="px-3 py-2">{r.user}</td>
                <td className="px-3 py-2">{r.score}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {assets.map((a) => <Badge key={a}>{a}</Badge>)}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
