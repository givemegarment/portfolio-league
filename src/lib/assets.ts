/**
 * Centralized asset definitions for Portfolio League
 * 
 * Contains all supported tokens with their metadata, colors, and CoinGecko IDs
 */

export type Asset = {
  symbol: string;
  name: string;
  coingeckoId: string;
  color: string;
  logo: string;
};

export type AssetCategory = keyof typeof ASSET_CATEGORIES;

/**
 * All supported assets in Portfolio League
 */
export const SUPPORTED_ASSETS: Asset[] = [
  // Majors
  { symbol: 'BTC', name: 'Bitcoin', coingeckoId: 'bitcoin', color: '#F7931A', logo: '/coins/btc.svg' },
  { symbol: 'ETH', name: 'Ethereum', coingeckoId: 'ethereum', color: '#627EEA', logo: '/coins/eth.svg' },
  { symbol: 'SOL', name: 'Solana', coingeckoId: 'solana', color: '#9945FF', logo: '/coins/sol.svg' },
  
  // Stablecoins
  { symbol: 'USDC', name: 'USD Coin', coingeckoId: 'usd-coin', color: '#2775CA', logo: '/coins/usdc.svg' },
  { symbol: 'USDT', name: 'Tether', coingeckoId: 'tether', color: '#26A17B', logo: '/coins/usdt.svg' },
  { symbol: 'DAI', name: 'Dai', coingeckoId: 'dai', color: '#F5AC37', logo: '/coins/dai.svg' },
  
  // Base Ecosystem
  { symbol: 'AERO', name: 'Aerodrome', coingeckoId: 'aerodrome-finance', color: '#0052FF', logo: '/coins/aero.svg' },
  { symbol: 'DEGEN', name: 'Degen', coingeckoId: 'degen-base', color: '#A36EFD', logo: '/coins/degen.svg' },
  { symbol: 'BRETT', name: 'Brett', coingeckoId: 'brett', color: '#0052FF', logo: '/coins/brett.svg' },
  { symbol: 'TOSHI', name: 'Toshi', coingeckoId: 'toshi', color: '#1D4ED8', logo: '/coins/toshi.svg' },
  { symbol: 'HIGHER', name: 'Higher', coingeckoId: 'higher', color: '#22C55E', logo: '/coins/higher.svg' },
  
  // L2 Tokens
  { symbol: 'OP', name: 'Optimism', coingeckoId: 'optimism', color: '#FF0420', logo: '/coins/op.svg' },
  { symbol: 'ARB', name: 'Arbitrum', coingeckoId: 'arbitrum', color: '#28A0F0', logo: '/coins/arb.svg' },
  { symbol: 'POL', name: 'Polygon', coingeckoId: 'polygon-ecosystem-token', color: '#8247E5', logo: '/coins/matic.svg' },
  
  // DeFi Blue Chips
  { symbol: 'LINK', name: 'Chainlink', coingeckoId: 'chainlink', color: '#2A5ADA', logo: '/coins/link.svg' },
  { symbol: 'UNI', name: 'Uniswap', coingeckoId: 'uniswap', color: '#FF007A', logo: '/coins/uni.svg' },
  { symbol: 'AAVE', name: 'Aave', coingeckoId: 'aave', color: '#B6509E', logo: '/coins/aave.svg' },
  { symbol: 'MKR', name: 'Maker', coingeckoId: 'maker', color: '#1AAB9B', logo: '/coins/mkr.svg' },
  { symbol: 'CRV', name: 'Curve', coingeckoId: 'curve-dao-token', color: '#FF4C4C', logo: '/coins/crv.svg' },
  
  // AI & Meme
  { symbol: 'PEPE', name: 'Pepe', coingeckoId: 'pepe', color: '#4CAF50', logo: '/coins/pepe.svg' },
  { symbol: 'WIF', name: 'dogwifhat', coingeckoId: 'dogwifcoin', color: '#F5A623', logo: '/coins/wif.svg' },
  { symbol: 'BONK', name: 'Bonk', coingeckoId: 'bonk', color: '#F9A825', logo: '/coins/bonk.svg' },
  { symbol: 'RENDER', name: 'Render', coingeckoId: 'render-token', color: '#00BFFF', logo: '/coins/render.svg' },
  { symbol: 'FET', name: 'Fetch.ai', coingeckoId: 'fetch-ai', color: '#1D2951', logo: '/coins/fet.svg' },
  
  // Alt L1s
  { symbol: 'AVAX', name: 'Avalanche', coingeckoId: 'avalanche-2', color: '#E84142', logo: '/coins/avax.svg' },
  { symbol: 'NEAR', name: 'NEAR', coingeckoId: 'near', color: '#00C08B', logo: '/coins/near.svg' },
  { symbol: 'INJ', name: 'Injective', coingeckoId: 'injective-protocol', color: '#00F2FE', logo: '/coins/inj.svg' },
  { symbol: 'SUI', name: 'Sui', coingeckoId: 'sui', color: '#4DA2FF', logo: '/coins/sui.svg' },
  { symbol: 'APT', name: 'Aptos', coingeckoId: 'aptos', color: '#2DD8A7', logo: '/coins/apt.svg' },
];

/**
 * Asset categories for filtering
 */
export const ASSET_CATEGORIES = {
  'All': SUPPORTED_ASSETS.map(a => a.symbol),
  'Majors': ['BTC', 'ETH', 'SOL'],
  'Stablecoins': ['USDC', 'USDT', 'DAI'],
  'Base Ecosystem': ['AERO', 'DEGEN', 'BRETT', 'TOSHI', 'HIGHER'],
  'L2 Tokens': ['OP', 'ARB', 'POL'],
  'DeFi': ['LINK', 'UNI', 'AAVE', 'MKR', 'CRV'],
  'AI & Meme': ['PEPE', 'WIF', 'BONK', 'RENDER', 'FET'],
  'Alt L1s': ['AVAX', 'NEAR', 'INJ', 'SUI', 'APT'],
} as const;

/**
 * Get asset by symbol
 */
export function getAsset(symbol: string): Asset | undefined {
  return SUPPORTED_ASSETS.find(a => a.symbol === symbol);
}

/**
 * Get assets by category
 */
export function getAssetsByCategory(category: AssetCategory): Asset[] {
  const symbols = ASSET_CATEGORIES[category] as readonly string[];
  return SUPPORTED_ASSETS.filter(a => symbols.includes(a.symbol));
}

/**
 * Get all category names
 */
export function getCategoryNames(): AssetCategory[] {
  return Object.keys(ASSET_CATEGORIES) as AssetCategory[];
}

/**
 * Build CoinGecko IDs mapping from assets
 */
export function getCoingeckoIdMap(): Record<string, string> {
  return SUPPORTED_ASSETS.reduce((acc, asset) => {
    acc[asset.symbol] = asset.coingeckoId;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Get all CoinGecko IDs as comma-separated string
 */
export function getCoingeckoIdsString(): string {
  return SUPPORTED_ASSETS.map(a => a.coingeckoId).join(',');
}

/**
 * Search assets by query (matches symbol or name)
 */
export function searchAssets(query: string): Asset[] {
  const lowerQuery = query.toLowerCase();
  return SUPPORTED_ASSETS.filter(
    a => a.symbol.toLowerCase().includes(lowerQuery) || 
         a.name.toLowerCase().includes(lowerQuery)
  );
}




