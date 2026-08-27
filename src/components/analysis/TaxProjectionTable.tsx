import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ProjectionYear } from '../../types';

/**
 * Tax Projection Table - Displays year-by-year tax breakdown for retirement years.
 *
 * Shows gross withdrawal, federal tax, state tax, capital gains tax, NIIT,
 * net income, and effective tax rate for each year of retirement.
 */
export interface TaxProjectionTableProps {
  projection: ProjectionYear[];
  retirementAge: number;
}

export const TaxProjectionTable: React.FC<TaxProjectionTableProps> = ({ projection, retirementAge }) => {
  // Filter to retirement years only (when taxes apply)
  const retirementYears = projection.filter(
    (year) => year.age >= retirementAge && year.grossWithdrawal !== undefined
  );

  if (retirementYears.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No tax data available. Enter account breakdowns and tax settings to see tax projections.
        </Typography>
      </Box>
    );
  }

  // Calculate totals
  const totalGross = retirementYears.reduce((sum, y) => sum + (y.grossWithdrawal ?? 0), 0);
  const totalFederal = retirementYears.reduce((sum, y) => sum + (y.federalTax ?? 0), 0);
  const totalState = retirementYears.reduce((sum, y) => sum + (y.stateTax ?? 0), 0);
  const totalCapitalGains = retirementYears.reduce((sum, y) => sum + (y.capitalGainsTax ?? 0), 0);
  const totalNIIT = retirementYears.reduce((sum, y) => sum + (y.niit ?? 0), 0);
  const totalTax = retirementYears.reduce((sum, y) => sum + (y.totalTax ?? 0), 0);
  const totalAfterTax = retirementYears.reduce((sum, y) => sum + (y.afterTaxIncome ?? 0), 0);
  const overallEffectiveRate = totalGross > 0 ? (totalTax / totalGross) * 100 : 0;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
        Tax Projections by Year
      </Typography>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600 }}>Age</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Gross Withdrawal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Federal Tax</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>State Tax</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Cap Gains</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>NIIT</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Total Tax</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Net Income</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Eff. Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {retirementYears.map((year) => (
              <TableRow key={year.age} hover>
                <TableCell>{year.age}</TableCell>
                <TableCell align="right">${(year.grossWithdrawal ?? 0).toLocaleString()}</TableCell>
                <TableCell align="right">${(year.federalTax ?? 0).toLocaleString()}</TableCell>
                <TableCell align="right">${(year.stateTax ?? 0).toLocaleString()}</TableCell>
                <TableCell align="right">${(year.capitalGainsTax ?? 0).toLocaleString()}</TableCell>
                <TableCell align="right">${(year.niit ?? 0).toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                  ${(year.totalTax ?? 0).toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                  ${(year.afterTaxIncome ?? 0).toLocaleString()}
                </TableCell>
                <TableCell align="right">{(year.effectiveTaxRate ?? 0).toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            {/* Totals row */}
            <TableRow sx={{ bgcolor: 'grey.200', fontWeight: 600 }}>
              <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>${totalGross.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>${totalFederal.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>${totalState.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>${totalCapitalGains.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>${totalNIIT.toLocaleString()}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                ${totalTax.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>
                ${totalAfterTax.toLocaleString()}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{overallEffectiveRate.toFixed(1)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          <strong>Note:</strong> Tax calculations are based on {new Date().getFullYear()} tax brackets and your configured
          filing status and state tax rate. RMDs are calculated starting at age 73 (or 75 if born after 1959).
          Withdrawals are assumed to come proportionally from all account types unless RMDs require Traditional withdrawals.
        </Typography>
      </Box>
    </Box>
  );
};
