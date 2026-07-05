import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { AnnualActuals, LifeEvent, ProjectionYear } from '../types';

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
  if (!projection || projection.length === 0) return null;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Year-by-Year Projection
      </Typography>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projection.map((year) => {
              const actualYear = actual.find(a => a.age === year.age);
              const activeEvents = lifeEvents.filter(e => {
                if (e.type === 'one-time') return e.startAge === year.age;
                const end = e.endAge ?? Infinity;
                return year.age >= e.startAge && year.age <= end;
              });
              const isActual = !!actualYear;

              return (
                <TableRow
                  key={year.age}
                  sx={{
                    backgroundColor: isActual ? '#e8f5e9' : year.isCoasting ? '#fff8e1' : undefined,
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  }}
                >
                  <TableCell>
                    {year.age}
                    {year.isCoasting && (
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#ff9800' }}>
                        ⛵
                      </Typography>
                    )}
                    {isActual && (
                      <Typography component="span" variant="caption" sx={{ ml: 0.5, color: '#4caf50' }}>
                        ✓
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">{fmt(year.portfolio)}</TableCell>
                  <TableCell align="right">{fmt(year.portfolioAfterInflation)}</TableCell>
                  <TableCell align="right" sx={{ color: year.annualContribution < 0 ? '#f44336' : '#4caf50' }}>
                    {fmt(year.annualContribution)}
                  </TableCell>
                  <TableCell align="right">{fmt(year.annualSpending)}</TableCell>
                  <TableCell align="right">{fmt(year.annualReturn)}</TableCell>
                  <TableCell align="right">{year.ssIncome > 0 ? fmt(year.ssIncome) : '-'}</TableCell>
                  <TableCell align="right">{year.pensionIncome ? fmt(year.pensionIncome) : '-'}</TableCell>
                  <TableCell align="right">{year.annualDebtPayments ? fmt(year.annualDebtPayments) : '-'}</TableCell>
                  <TableCell align="right">{year.healthCareCost ? fmt(year.healthCareCost) : '-'}</TableCell>
                  <TableCell align="right">{fmtPct(year.inflationRate)}</TableCell>
                  <TableCell>
                    {activeEvents.map(e => (
                      <Typography key={e.id} variant="caption" sx={{ display: 'block' }}>
                        {e.name}
                      </Typography>
                    ))}
                    {isActual && (
                      <Typography variant="caption" sx={{ color: '#4caf50' }}>
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
