'use client';

import React, { useState } from 'react';

const ASSETS = ['BTC', 'ETH', 'SOL', 'USDC'] as const;
type Asset = (typeof ASSETS)[number];
type Props = { address?: `0x${string}` };

export default function PortfolioBuilder({ address }: Props) {
  const [basket, setBasket] = useState<Asset[]>(['BTC', 'ETH', 'SOL']);
  const [loading, setLoading] = useState(false);

  const onSelect =
    (i: number) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const next = [...basket];
      next[i] = e.target.value as Asset;
      setBasket(next);
    };

  const save = async () => {
    setLoading(true);
    try {
      const addr = address ?? '0xYOU';
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr, basket }),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {basket.map((v, i) => (
        <select key={i} value={v} onChange={onSelect(i)} className="border p-2 rounded">
          {ASSETS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      ))}
      <button onClick={save} disabled={loading || !address} className="border px-3 py-2 rounded">
        {loading ? 'Saving…' : (address ? 'Save Picks' : 'Connect wallet to save')}
      </button>
    </div>
  );
}
