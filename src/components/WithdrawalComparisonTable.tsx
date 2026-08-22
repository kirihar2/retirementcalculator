import React, { useMemo } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material';
import { WithdrawalUtils, type WithdrawalComparisonResult } from '../types/withdrawal-strategies';

/**
 * Withdrawal Strategy Comparison Table
 *
 * Displays side-by-side comparison of withdrawal strategies
 * with portfolio values at key ages and depletion info.
 */
export interface WithdrawalComparisonTableProps {
  initialPortfolio: number;
  retirementAge: number;
  lifeExpectancy: number;
  expectedReturn: number;     // percentage, e.g. 7
  inflationRate: number;      // percentage, e.g. 3
  selectedStrategyId?: string;
  onStrategySelect?: (strategyId: string) => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export function WithdrawalComparisonTable({
  initialPortfolio,
  retirementAge,
  lifeExpectancy,
  expectedReturn,
  inflationRate,
  selectedStrategyId,
  onStrategySelect,
}: WithdrawalComparisonTableProps) {
  const comparisons = useMemo(() => {
    return WithdrawalUtils.compareStrategies(
      initialPortfolio,
      retirementAge,
      lifeExpectancy,
      expectedReturn / 100,
      inflationRate / 100,
    );
  }, [initialPortfolio, retirementAge, lifeExpectancy, expectedReturn, inflationRate]);

  // Find best strategy: the one with latest depletion (or highest portfolio at 100 if none deplete)
  const bestStrategyId = useMemo(() => {
    const surviving = comparisons.filter(c => c.portfolioDepletedAt === null);
    if (surviving.length > 0) {
      // Pick the one with highest portfolio at age 100
      return surviving.reduce((best, c) =>
        c.portfolioAtAge100 > best.portfolioAtAge100 ? c : best
      ).strategyId;
    }
    // All deplete - pick the one with latest depletion
    return comparisons.reduce((best, c) =>
      (c.portfolioDepletedAt ?? 0) > (best.portfolioDepletedAt ?? 0) ? c : best
    ).strategyId;
  }, [comparisons]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Typography variant="h6" fontWeight="bold">
        Withdrawal Strategy Comparison
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Compare how different withdrawal strategies affect your portfolio over time.
      </Typography>

      {/* Input Parameters */}
      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
          Comparison Inputs (in nominal future dollars):
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Typography variant="caption">Starting Portfolio:</Typography>
          <Typography variant="caption" fontWeight="bold">{formatCurrency(initialPortfolio)}</Typography>
          <Typography variant="caption">Retirement Age:</Typography>
          <Typography variant="caption" fontWeight="bold">{retirementAge}</Typography>
          <Typography variant="caption">Life Expectancy:</Typography>
          <Typography variant="caption" fontWeight="bold">{lifeExpectancy}</Typography>
          <Typography variant="caption">Expected Return:</Typography>
          <Typography variant="caption" fontWeight="bold">{expectedReturn}%</Typography>
          <Typography variant="caption">Inflation Rate:</Typography>
          <Typography variant="caption" fontWeight="bold">{inflationRate}%</Typography>
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell><strong>Strategy</strong></TableCell>
              <TableCell align="right"><strong>Age 80</strong></TableCell>
              <TableCell align="right"><strong>Age 90</strong></TableCell>
              <TableCell align="right"><strong>Age 100</strong></TableCell>
              <TableCell align="right"><strong>Depletion Age</strong></TableCell>
              <TableCell align="center"><strong>Select</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisons.map((comp) => {
              const isBest = comp.strategyId === bestStrategyId;
              const isSelected = comp.strategyId === selectedStrategyId;
              const isDepleted = comp.portfolioDepletedAt !== null;

              return (
                <TableRow
                  key={comp.strategyId}
                  sx={{
                    bgcolor: isSelected ? '#e3f2fd' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? '#bbdefb' : 'action.hover' },
                    // Ensure text is dark enough on selected row background
                    ...(isSelected && {
                      '& td': { color: '#0d47a1' },
                    }),
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography component="span" variant="body2" fontWeight="bold">
                          {comp.strategyName}
                          {isBest && <Chip label="Recommended" size="small" color="success" sx={{ ml: 1, height: 20 }} />}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {comp.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: comp.portfolioAtAge80 <= 0 ? '#c62828' : 'inherit',
                    fontWeight: comp.portfolioAtAge80 <= 0 ? 600 : undefined,
                  }}>
                    {formatCurrency(comp.portfolioAtAge80)}
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: comp.portfolioAtAge90 <= 0 ? '#c62828' : 'inherit',
                    fontWeight: comp.portfolioAtAge90 <= 0 ? 600 : undefined,
                  }}>
                    {formatCurrency(comp.portfolioAtAge90)}
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: comp.portfolioAtAge100 <= 0 ? '#c62828' : 'inherit',
                    fontWeight: comp.portfolioAtAge100 <= 0 ? 600 : undefined,
                  }}>
                    {formatCurrency(comp.portfolioAtAge100)}
                  </TableCell>
                  <TableCell align="right">
                    {isDepleted ? (
                      <Typography variant="body2" sx={{ color: '#c62828', fontWeight: 600 }}>
                        Age {comp.portfolioDepletedAt}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        Survives
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => onStrategySelect?.(comp.strategyId)}
                      sx={{ textTransform: 'none' }}
                    >
                      {isSelected ? 'Selected' : 'Use'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="textSecondary">
        Projections assume {expectedReturn}% average annual return and {inflationRate}% inflation.
        Actual results will vary based on market performance.
      </Typography>
    </Box>
  );
}
