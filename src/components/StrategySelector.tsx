import React from 'react';
import { Box, Button, Typography, Divider } from '@mui/material';

/**
 * Investment strategy preset definition
 */
export interface InvestmentStrategyPreset {
  id: string;
  name: string;
  description: string;
  stockPercent: number;         // 0-100
  bondPercent: number;          // 0-100
  expectedReturn: number;       // percentage (e.g. 7 means 7%)
}

// Historical average returns (US market)
const STOCK_RETURN = 9;   // ~9% historical US stock market average
const BOND_RETURN = 3;    // ~3% historical US bond average

/**
 * Calculate expected return from stock/bond allocation using historical averages.
 */
export function calculateExpectedReturn(stockPercent: number, bondPercent: number): number {
  return (stockPercent * STOCK_RETURN + bondPercent * BOND_RETURN) / 100;
}

/**
 * Strategy Presets - Quick-apply allocation strategies
 */
export const strategyPresets: InvestmentStrategyPreset[] = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: '40% US Stocks / 60% Bonds - Lower risk, ~5-6% expected return',
    stockPercent: 40,
    bondPercent: 60,
    expectedReturn: calculateExpectedReturn(40, 60),
  },
  {
    id: 'moderate',
    name: 'Moderate',
    description: '70% US Stocks / 30% Bonds - Balanced risk, ~7% expected return',
    stockPercent: 70,
    bondPercent: 30,
    expectedReturn: calculateExpectedReturn(70, 30),
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: '85% US Stocks / 15% Bonds - Higher growth potential, ~8-9% return',
    stockPercent: 85,
    bondPercent: 15,
    expectedReturn: calculateExpectedReturn(85, 15),
  },
];

/**
 * Strategy Selector Component
 * Quick-apply allocation strategy presets
 */
export interface StrategySelectorProps {
  currentStrategy: string;                                     // Currently selected preset ID
  onStrategyChange: (strategy: string) => void;                // Callback to apply new strategy
  onAllocationChange?: (stockPercent: number, bondPercent: number, expectedReturn: number) => void;
}

/**
 * Validate that stock and bond allocations sum to 100%
 */
export function validateAllocation(stockPercent: number, bondPercent: number): { valid: boolean; error?: string } {
  const total = stockPercent + bondPercent;
  if (Math.abs(total - 100) > 0.01) {
    return { valid: false, error: `Allocations must sum to 100% (currently ${total.toFixed(1)}%)` };
  }
  if (stockPercent < 0 || bondPercent < 0) {
    return { valid: false, error: 'Allocations cannot be negative' };
  }
  return { valid: true };
}

/**
 * Validate expected return is within reasonable bounds
 */
export function validateExpectedReturn(returnRate: number): { valid: boolean; warning?: string } {
  if (returnRate < 2) {
    return { valid: false, warning: 'Expected return is below historical range (< 2%)' };
  }
  if (returnRate > 12) {
    return { valid: false, warning: 'Expected return is above historical range (> 12%)' };
  }
  return { valid: true };
}

export function StrategySelector({
  currentStrategy,
  onStrategyChange,
  onAllocationChange,
}: StrategySelectorProps) {
  const handleStrategyClick = (preset: InvestmentStrategyPreset) => {
    onStrategyChange(preset.id);
    onAllocationChange?.(preset.stockPercent, preset.bondPercent, preset.expectedReturn);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Title */}
      <Typography variant="h6" fontWeight="bold">Strategy Presets</Typography>

      {/* Strategy Cards */}
      {strategyPresets.map((strategy) => (
        <Button
          key={strategy.id}
          variant={currentStrategy === strategy.id ? 'contained' : 'outlined'}
          size="small"
          onClick={() => handleStrategyClick(strategy)}
          sx={{
            justifyContent: 'flex-start',
            textTransform: 'none',
            minWidth: 200,
          }}
        >
          <Box component="span">
            <strong>{strategy.name}</strong> - {strategy.description}
          </Box>
        </Button>
      ))}

      {/* Divider */}
      <Divider />

      {/* Tips */}
      <Typography variant="caption" color="textSecondary">
        Tip: Choose a strategy for quick allocation, then customize as needed.
        Expected returns use historical averages: ~{STOCK_RETURN}% stocks, ~{BOND_RETURN}% bonds.
      </Typography>
    </Box>
  );
}
