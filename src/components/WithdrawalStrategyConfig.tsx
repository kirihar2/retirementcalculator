import React, { useState } from 'react';
import {
  Box, Typography, Slider, Button, Paper, Chip, IconButton, Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import type { WithdrawalStrategy } from '../types/withdrawal-strategies';
import { getStrategyById } from '../types/withdrawal-strategies';

/**
 * Custom overrides for a withdrawal strategy, persisted to localStorage.
 */
export interface StrategyOverrides {
  baseWithdrawalRate?: number;
  annualAdjustmentRate?: number;
  maxAnnualIncreasePercent?: number;
  minWithdrawalPercent?: number;
}

const STORAGE_KEY = 'fire_withdrawal_strategy_overrides';

function loadOverrides(): Record<string, StrategyOverrides> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, StrategyOverrides>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

/**
 * Build the effective strategy by merging base strategy with any saved overrides.
 * Used by FIRECalculator to pass the customized strategy to projection calculations.
 */
export function getEffectiveStrategy(strategyId: string): WithdrawalStrategy | undefined {
  const base = getStrategyById(strategyId);
  if (!base) return undefined;

  const allOverrides = loadOverrides();
  const o = allOverrides[strategyId];
  if (!o) return base;

  return {
    ...base,
    baseWithdrawalRate: o.baseWithdrawalRate ?? base.baseWithdrawalRate,
    annualAdjustmentRate: o.annualAdjustmentRate ?? base.annualAdjustmentRate,
    maxAnnualIncreasePercent: o.maxAnnualIncreasePercent ?? base.maxAnnualIncreasePercent,
    minWithdrawalPercent: o.minWithdrawalPercent ?? base.minWithdrawalPercent,
  };
}

export interface WithdrawalStrategyConfigProps {
  selectedStrategyId: string;
  /** Called when overrides change, so parent can recalculate projections */
  onChange?: () => void;
}

/**
 * WithdrawalStrategyConfig - Customize parameters for the selected withdrawal strategy.
 *
 * Shows editable sliders for the strategy's key parameters, with the ability
 * to reset to defaults. Changes are persisted to localStorage and automatically
 * picked up by the projection calculations.
 */
export function WithdrawalStrategyConfig({
  selectedStrategyId,
  onChange,
}: WithdrawalStrategyConfigProps) {
  const [expanded, setExpanded] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, StrategyOverrides>>(loadOverrides);

  const baseStrategy = getStrategyById(selectedStrategyId);
  const currentOverrides = overrides[selectedStrategyId] || {};

  if (!baseStrategy) return null;

  const hasOverrides = Object.keys(currentOverrides).length > 0;

  const updateOverride = (key: keyof StrategyOverrides, value: number) => {
    const updated = {
      ...overrides,
      [selectedStrategyId]: {
        ...currentOverrides,
        [key]: value,
      },
    };
    setOverrides(updated);
    saveOverrides(updated);
    onChange?.();
  };

  const resetOverrides = () => {
    const updated = { ...overrides };
    delete updated[selectedStrategyId];
    setOverrides(updated);
    saveOverrides(updated);
    onChange?.();
  };

  const getValue = (key: keyof StrategyOverrides, fallback: number | undefined): number => {
    return currentOverrides[key] ?? fallback ?? 0;
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 2 : 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon fontSize="small" color="action" />
          <Typography variant="subtitle2">
            {baseStrategy.name} Parameters
          </Typography>
          {hasOverrides && (
            <Chip label="Customized" size="small" color="primary" variant="outlined" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {hasOverrides && (
            <Tooltip title="Reset to defaults">
              <IconButton size="small" onClick={resetOverrides}>
                <ResetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            <Typography variant="caption">{expanded ? 'Hide' : 'Configure'}</Typography>
          </IconButton>
        </Box>
      </Box>

      {expanded && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Base Withdrawal Rate */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Base Withdrawal Rate: {getValue('baseWithdrawalRate', baseStrategy.baseWithdrawalRate).toFixed(1)}%
            </Typography>
            <Slider
              size="small"
              value={getValue('baseWithdrawalRate', baseStrategy.baseWithdrawalRate)}
              onChange={(_, v) => updateOverride('baseWithdrawalRate', v as number)}
              min={1}
              max={6}
              step={0.25}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              marks={[
                { value: 3, label: '3%' },
                { value: 4, label: '4%' },
              ]}
            />
          </Box>

          {/* Annual Adjustment Rate (inflation) */}
          {(baseStrategy.annualAdjustmentRate !== undefined || currentOverrides.annualAdjustmentRate !== undefined) && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Annual Adjustment Rate: {getValue('annualAdjustmentRate', baseStrategy.annualAdjustmentRate).toFixed(1)}%
              </Typography>
              <Slider
                size="small"
                value={getValue('annualAdjustmentRate', baseStrategy.annualAdjustmentRate)}
                onChange={(_, v) => updateOverride('annualAdjustmentRate', v as number)}
                min={0}
                max={6}
                step={0.25}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
            </Box>
          )}

          {/* Max Annual Increase (Bogleheads / Dynamic) */}
          {(baseStrategy.maxAnnualIncreasePercent !== undefined || currentOverrides.maxAnnualIncreasePercent !== undefined) && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Max Annual Increase: {getValue('maxAnnualIncreasePercent', baseStrategy.maxAnnualIncreasePercent).toFixed(1)}%
              </Typography>
              <Slider
                size="small"
                value={getValue('maxAnnualIncreasePercent', baseStrategy.maxAnnualIncreasePercent)}
                onChange={(_, v) => updateOverride('maxAnnualIncreasePercent', v as number)}
                min={0}
                max={10}
                step={0.5}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
            </Box>
          )}

          {/* Min Withdrawal Rate (Bogleheads) */}
          {(baseStrategy.minWithdrawalPercent !== undefined || currentOverrides.minWithdrawalPercent !== undefined) && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Min Withdrawal Rate: {getValue('minWithdrawalPercent', baseStrategy.minWithdrawalPercent).toFixed(1)}%
              </Typography>
              <Slider
                size="small"
                value={getValue('minWithdrawalPercent', baseStrategy.minWithdrawalPercent)}
                onChange={(_, v) => updateOverride('minWithdrawalPercent', v as number)}
                min={1}
                max={4}
                step={0.25}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
              />
            </Box>
          )}

          {hasOverrides && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Parameters customized for {baseStrategy.name}. Changes apply to projections immediately.
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
