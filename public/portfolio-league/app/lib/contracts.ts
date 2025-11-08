// Contract addresses on Base mainnet
export const CONTRACTS = {
  PORTFOLIO_LEAGUE: process.env.NEXT_PUBLIC_PORTFOLIO_LEAGUE_CONTRACT || '',
  USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  PRICE_ORACLE: process.env.NEXT_PUBLIC_PRICE_ORACLE_ADDRESS || '',
};

// Simplified ABI for Portfolio League contract
export const PORTFOLIO_LEAGUE_ABI = [
  {
    inputs: [
      { name: '_assets', type: 'uint8[3]' },
      { name: '_allocations', type: 'uint8[3]' },
    ],
    name: 'submitPortfolio',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_season', type: 'uint256' }],
    name: 'claimPrize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_season', type: 'uint256' },
      { name: '_tokenURI', type: 'string' },
    ],
    name: 'mintBadge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: '_season', type: 'uint256' },
      { name: '_user', type: 'address' },
    ],
    name: 'getPortfolio',
    outputs: [
      { name: 'assets', type: 'uint8[3]' },
      { name: 'allocations', type: 'uint8[3]' },
      { name: 'submittedAt', type: 'uint256' },
      { name: 'initialValue', type: 'uint256' },
      { name: 'finalValue', type: 'uint256' },
      { name: 'rank', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: '_season', type: 'uint256' },
      { name: '_limit', type: 'uint256' },
    ],
    name: 'getLeaderboard',
    outputs: [
      { name: 'users', type: 'address[]' },
      { name: 'values', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'currentSeason',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ERC20 ABI (for USDC)
export const ERC20_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
