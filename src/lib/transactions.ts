/**
 * Transaction tracking utilities
 * 
 * Tracks portfolio allocation changes and submissions as transactions
 */

import { redis } from './redis';
import { getCurrentWeek } from './weeks';

export type TransactionType = 'allocation_change' | 'portfolio_submit';

export type TransactionChange = {
  symbol: string;
  oldPercentage?: number;
  newPercentage: number;
  action: 'added' | 'removed' | 'modified';
};

export type Transaction = {
  id: string;
  address: string;
  type: TransactionType;
  timestamp: number;
  week: number;
  season: string;
  changes: TransactionChange[];
  entryPrices: Record<string, number>;
  pnl?: number; // Calculated when week ends
};

/**
 * Generate transaction ID
 */
function generateTransactionId(address: string, timestamp: number): string {
  return `${address.toLowerCase()}-${timestamp}`;
}

/**
 * Calculate changes between two allocation sets
 */
export function calculateAllocationChanges(
  oldAllocations: Array<{ symbol: string; percentage: number }>,
  newAllocations: Array<{ symbol: string; percentage: number }>
): TransactionChange[] {
  const oldMap = new Map(oldAllocations.map(a => [a.symbol, a.percentage]));
  const newMap = new Map(newAllocations.map(a => [a.symbol, a.percentage]));
  
  const changes: TransactionChange[] = [];
  const allSymbols = new Set([...oldMap.keys(), ...newMap.keys()]);
  
  for (const symbol of allSymbols) {
    const oldPct = oldMap.get(symbol) || 0;
    const newPct = newMap.get(symbol) || 0;
    
    if (oldPct === newPct) continue;
    
    if (oldPct === 0 && newPct > 0) {
      changes.push({
        symbol,
        newPercentage: newPct,
        action: 'added',
      });
    } else if (oldPct > 0 && newPct === 0) {
      changes.push({
        symbol,
        oldPercentage: oldPct,
        newPercentage: 0,
        action: 'removed',
      });
    } else {
      changes.push({
        symbol,
        oldPercentage: oldPct,
        newPercentage: newPct,
        action: 'modified',
      });
    }
  }
  
  return changes;
}

/**
 * Store a transaction in Redis
 */
export async function storeTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
  const id = generateTransactionId(transaction.address, transaction.timestamp);
  const fullTransaction: Transaction = { ...transaction, id };
  
  // Store in sorted set with timestamp as score for efficient range queries
  const key = `transactions:${transaction.address.toLowerCase()}`;
  
  // Store transaction data
  await redis.zadd(key, {
    score: transaction.timestamp,
    member: JSON.stringify(fullTransaction),
  });
  
  // Set expiration (keep transactions for 1 year)
  await redis.expire(key, 365 * 24 * 60 * 60);
  
  return id;
}

/**
 * Get transactions for an address within a time range
 */
export async function getTransactions(
  address: string,
  options?: {
    startTime?: number;
    endTime?: number;
    limit?: number;
    type?: TransactionType;
  }
): Promise<Transaction[]> {
  const key = `transactions:${address.toLowerCase()}`;
  
  const startTime = options?.startTime || 0;
  const endTime = options?.endTime || Date.now();
  const limit = options?.limit || 100;
  
  // Get transactions from sorted set
  const members = await redis.zrange<string[]>(
    key,
    startTime,
    endTime,
    {
      byScore: true,
      rev: true, // Most recent first
      limit: { count: limit, offset: 0 },
    }
  );
  
  if (!members || members.length === 0) {
    return [];
  }
  
  const transactions: Transaction[] = members
    .map(member => {
      try {
        return JSON.parse(member) as Transaction;
      } catch {
        return null;
      }
    })
    .filter((t): t is Transaction => t !== null);
  
  // Filter by type if specified
  if (options?.type) {
    return transactions.filter(t => t.type === options.type);
  }
  
  return transactions;
}

/**
 * Create a transaction for portfolio submission
 */
export async function createPortfolioSubmitTransaction(
  address: string,
  allocations: Array<{ symbol: string; percentage: number }>,
  entryPrices: Record<string, number>
): Promise<string> {
  const { season, week } = getCurrentWeek();
  const timestamp = Date.now();
  
  const transaction: Omit<Transaction, 'id'> = {
    address,
    type: 'portfolio_submit',
    timestamp,
    week,
    season,
    changes: allocations.map(a => ({
      symbol: a.symbol,
      newPercentage: a.percentage,
      action: 'added' as const,
    })),
    entryPrices,
  };
  
  return storeTransaction(transaction);
}

/**
 * Create a transaction for allocation change
 */
export async function createAllocationChangeTransaction(
  address: string,
  oldAllocations: Array<{ symbol: string; percentage: number }>,
  newAllocations: Array<{ symbol: string; percentage: number }>,
  entryPrices: Record<string, number>
): Promise<string | null> {
  const changes = calculateAllocationChanges(oldAllocations, newAllocations);
  
  // Only create transaction if there are actual changes
  if (changes.length === 0) {
    return null;
  }
  
  const { season, week } = getCurrentWeek();
  const timestamp = Date.now();
  
  const transaction: Omit<Transaction, 'id'> = {
    address,
    type: 'allocation_change',
    timestamp,
    week,
    season,
    changes,
    entryPrices,
  };
  
  return storeTransaction(transaction);
}

/**
 * Update transaction P&L after week ends
 */
export async function updateTransactionPnL(
  address: string,
  transactionId: string,
  pnl: number
): Promise<void> {
  const key = `transactions:${address.toLowerCase()}`;
  
  // Get all transactions
  const members = await redis.zrange<string[]>(key, '-inf', '+inf', {
    byScore: true,
  });
  
  if (!members) return;
  
  // Find and update the transaction
  for (let i = 0; i < members.length; i++) {
    try {
      const transaction = JSON.parse(members[i]) as Transaction;
      
      if (transaction.id === transactionId) {
        transaction.pnl = pnl;
        
        // Update in Redis
        await redis.zadd(key, {
          score: transaction.timestamp,
          member: JSON.stringify(transaction),
        });
        
        break;
      }
    } catch {
      continue;
    }
  }
}

/**
 * Get transaction statistics for an address
 */
export async function getTransactionStats(address: string): Promise<{
  totalTransactions: number;
  totalPnL: number;
  winRate: number;
  averagePnL: number;
}> {
  const transactions = await getTransactions(address, { limit: 1000 });
  
  const transactionsWithPnL = transactions.filter(t => t.pnl !== undefined);
  const totalPnL = transactionsWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const wins = transactionsWithPnL.filter(t => (t.pnl || 0) > 0).length;
  const winRate = transactionsWithPnL.length > 0 
    ? (wins / transactionsWithPnL.length) * 100 
    : 0;
  const averagePnL = transactionsWithPnL.length > 0
    ? totalPnL / transactionsWithPnL.length
    : 0;
  
  return {
    totalTransactions: transactions.length,
    totalPnL,
    winRate,
    averagePnL,
  };
}
