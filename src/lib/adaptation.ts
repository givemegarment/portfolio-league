/**
 * Adaptation module for Portfolio League
 * 
 * Handles emulation templates and strategy adaptation for following masters.
 */

import { Master, MasterHolding } from './masters';

export type EmulationAllocation = {
  symbol: string;
  percentage: number;
  originalPercentage: number;
};

export type EmulationTemplate = {
  allocations: EmulationAllocation[];
  sourceAddress: string;
  sourceName: string;
  createdAt: number;
};

/**
 * Create an emulation template from a master's holdings
 * This converts a master's current portfolio into a template
 * that users can apply to their own portfolio
 */
export function createEmulationTemplate(master: Master): EmulationAllocation[] {
  return master.holdings.map((holding: MasterHolding) => ({
    symbol: holding.symbol,
    percentage: holding.percentage,
    originalPercentage: holding.percentage,
  }));
}

/**
 * Adjust allocations to ensure they sum to 100%
 */
export function normalizeAllocations(allocations: EmulationAllocation[]): EmulationAllocation[] {
  const total = allocations.reduce((sum, a) => sum + a.percentage, 0);
  
  if (total === 0) return allocations;
  
  return allocations.map(a => ({
    ...a,
    percentage: Math.round((a.percentage / total) * 100 * 100) / 100,
  }));
}

/**
 * Scale allocations by a factor (for partial emulation)
 */
export function scaleAllocations(
  allocations: EmulationAllocation[], 
  scaleFactor: number
): EmulationAllocation[] {
  return allocations.map(a => ({
    ...a,
    percentage: Math.round(a.percentage * scaleFactor * 100) / 100,
  }));
}

/**
 * Merge user's existing allocations with emulation template
 */
export function mergeWithExisting(
  existing: EmulationAllocation[],
  template: EmulationAllocation[],
  templateWeight: number = 0.5
): EmulationAllocation[] {
  const merged = new Map<string, EmulationAllocation>();
  
  // Add existing allocations
  existing.forEach(a => {
    merged.set(a.symbol, {
      ...a,
      percentage: a.percentage * (1 - templateWeight),
    });
  });
  
  // Merge template allocations
  template.forEach(a => {
    const current = merged.get(a.symbol);
    if (current) {
      merged.set(a.symbol, {
        ...current,
        percentage: current.percentage + a.percentage * templateWeight,
      });
    } else {
      merged.set(a.symbol, {
        ...a,
        percentage: a.percentage * templateWeight,
      });
    }
  });
  
  return normalizeAllocations(Array.from(merged.values()));
}
