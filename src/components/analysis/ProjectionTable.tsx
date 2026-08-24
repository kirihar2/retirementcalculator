import { useMemo } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip } from '@mui/material';
import type { AnnualActuals, LifeEvent, ProjectionYear } from '../../types';
import {
  calculateAllVariances,
  calculateCumulativeVariance,
  formatVariance,
  getVarianceArrow,
  getVarianceColor,
} from '../../utils/variance';

interface ProjectionTableProps {
  projection: ProjectionYear[];
  lifeEvents: LifeEvent[];
  actual: AnnualActuals[];
}

function fmt(value: number | undefined | null): string {
  if (value == null) return '-';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function ProjectionTable({ projection, lifeEvents, actual }: ProjectionTableProps) {
  const variances = useMemo(() => {
    return calculateAllVariances(projection, actual);
  }, [projection, actual]);

  const cumulativeVariance = useMemo(() => {
    return calculateCumulativeVariance(variances.portfolio);
  }, [variances.portfolio]);

  if (!projection || projection.length === 0) return null;

  const hasActuals = actual.length > 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Year-by-Year Projection
        </Typography>

        {/* Cumulative Variance Summary */}
        {hasActuals && cumulativeVariance.totalYearsWithData > 0 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Avg Variance:
            </Typography>
            <Chip
              label={`${cumulativeVariance.averagePercentVariance >= 0 ? '+' : ''}${cumulativeVariance.averagePercentVariance.toFixed(1)}% ${
                cumulativeVariance.averagePercentVariance > 1 ? '↑' :
                cumulativeVariance.averagePercentVariance < -1 ? '↓' : '→'
              }`}
              size="small"
              sx={{
                bgcolor: cumulativeVariance.averagePercentVariance > 1 ? '#e8f5e9' :
                         cumulativeVariance.averagePercentVariance < -1 ? '#ffebee' : '#f5f5f5',
                color: cumulativeVariance.averagePercentVariance > 1 ? '#2e7d32' :
                       cumulativeVariance.averagePercentVariance < -1 ? '#c62828' : '#616161',
                fontWeight: 'bold',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Prompt when no actuals */}
      {!hasActuals && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          Add actuals to track variance against projections.
        </Typography>
      )}

      <TableContainer component={Paper} elevation={1} sx={{ maxHeight: 500, overflow: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Portfolio (Real)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Portfolio (Nominal)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Contribution</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Spending (Real)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Return</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">SS Income</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Pension</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Debt Pmts</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Healthcare</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Inflation</TableCell>
              {hasActuals && <TableCell sx={{ fontWeight: 'bold' }} align="right">Variance</TableCell>}
              <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projection.map((year, idx) => {
              const actualYear = actual.find(a => a.age === year.age);
              const activeEvents = lifeEvents.filter(e => {
                if (e.type === 'one-time') return e.startAge === year.age;
                const end = e.endAge ?? Infinity;
                return year.age >= e.startAge && year.age <= end;
              });
              const isActual = !!actualYear;
              const variance = variances.portfolio[idx];

              return (
                <TableRow
                  key={year.age}
                  sx={{
                    backgroundColor: isActual ? '#e8f5e9' : year.isCoasting ? '#fff8e1' : undefined,
                    '&:hover': { backgroundColor: '#f5f5f5' },
                    // Ensure all text in tinted rows is dark enough to read
                    '& td': isActual
                      ? { color: '#1b5e20' }
                      : year.isCoasting
                        ? { color: '#4e342e' }
                        : {},
                  }}
                >
                  <TableCell>
                    {year.age}
                    {year.isCoasting && (
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#e65100' }}>
                        ⛵
                      </Typography>
                    )}
                    {isActual && (
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#1b5e20' }}>
                        ✓
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{fmt(year.portfolio)}</TableCell>
                  <TableCell align="right">{fmt(year.portfolioAfterInflation)}</TableCell>
                  <TableCell align="right" sx={{
                    color: year.annualContribution < 0
                      ? (isActual ? '#b71c1c' : '#c62828')
                      : (isActual ? '#1b5e20' : '#2e7d32'),
                    fontWeight: 600,
                  }}>
                    {fmt(year.annualContribution)}
                  </TableCell>
                  <TableCell align="right">{fmt(year.annualSpending)}</TableCell>
                  <TableCell align="right">{fmt(year.annualReturn)}</TableCell>
                  <TableCell align="right">{year.ssIncome > 0 ? fmt(year.ssIncome) : '-'}</TableCell>
                  <TableCell align="right">{year.pensionIncome ? fmt(year.pensionIncome) : '-'}</TableCell>
                  <TableCell align="right">{year.annualDebtPayments ? fmt(year.annualDebtPayments) : '-'}</TableCell>
                  <TableCell align="right">{year.healthCareCost ? fmt(year.healthCareCost) : '-'}</TableCell>
                  <TableCell align="right">{fmtPct(year.inflationRate)}</TableCell>
                  {hasActuals && (
                    <TableCell
                      align="right"
                      sx={{
                        color: isActual
                          ? (variance.percentVariance > 1 ? '#1b5e20' : variance.percentVariance < -1 ? '#b71c1c' : '#424242')
                          : getVarianceColor(variance),
                        fontWeight: variance.hasData ? 'bold' : 'normal',
                      }}
                    >
                      {variance.hasData ? (
                        <>
                          {getVarianceArrow(variance)} {formatVariance(variance)}
                        </>
                      ) : (
                        <span style={{ color: '#757575' }}>N/A</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {activeEvents.map(e => (
                      <Typography key={e.id} variant="caption" sx={{ display: 'block' }}>
                        {e.name}
                      </Typography>
                    ))}
                    {isActual && (
                      <Typography variant="caption" sx={{ color: '#1b5e20', fontWeight: 600 }}>
                        Actual
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
