'use client';

import React, { useState } from 'react';

const ASSETS = ['BTC', 'ETH', 'SOL', 'USDC'] as const;
type Asset = (typeof ASSETS)[number];

export default function PortfolioBuilder() {
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
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: '0xYOU', basket }),
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
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      ))}
      <button onClick={save} disabled={loading} className="border px-3 py-2 rounded">
        {loading ? 'Saving…' : 'Save Picks'}
      </button>
    </div>
  );
}
