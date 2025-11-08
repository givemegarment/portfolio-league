'use client';

import React, { useState } from 'react';

const ASSETS = ['BTC', 'ETH', 'SOL', 'USDC'] as const;
type Asset = (typeof ASSETS)[number];
type Props = { address?: `0x${string}` };

export default function PortfolioBuilder({ address }: Props) {
  const [basket, setBasket] = useState<Asset[]>(['BTC', 'ETH', 'SOL']);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSelect =
    (i: number) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = [...basket];
      next[i] = e.target.value as Asset;
      setBasket(next);
    };

  const canSave = !!address && basket.length === 3;

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, basket }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus('Saved. Good luck this week!');
    } catch {
      setStatus('Something went wrong. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {basket.map((v, i) => (
          <select
            key={i}
            value={v}
            onChange={onSelect(i)}
            disabled={!address}
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none disabled:opacity-50"
          >
            {ASSETS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        ))}
      </div>

      <button
        onClick={save}
        disabled={!canSave || saving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {address ? (saving ? 'Saving…' : 'Save My Picks') : 'Connect wallet to save'}
      </button>

      <p className="text-xs text-neutral-400">Picks are tied to your address. You can resave until the gameweek locks.</p>
      {status && <div className="rounded-md bg-neutral-800 px-3 py-2 text-sm">{status}</div>}
    </div>
  );
}
