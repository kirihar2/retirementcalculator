import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import type { ProjectionYear } from '../../types';

export interface TaxOptimizationProps {
  projection: ProjectionYear[];
  retirementAge: number;
}

export const TaxOptimization: React.FC<TaxOptimizationProps> = ({ projection, retirementAge }) => {
  // Filter to retirement years
  const retirementYears = projection.filter(y => y.age >= retirementAge);

  // Calculate totals
  const totalGrossWithdrawal = retirementYears.reduce((sum, y) => sum + (y.grossWithdrawal || 0), 0);
  const totalFederalTax = retirementYears.reduce((sum, y) => sum + (y.federalTax || 0), 0);
  const totalStateTax = retirementYears.reduce((sum, y) => sum + (y.stateTax || 0), 0);
  const totalCapitalGainsTax = retirementYears.reduce((sum, y) => sum + (y.capitalGainsTax || 0), 0);
  const totalNIIT = retirementYears.reduce((sum, y) => sum + (y.niit || 0), 0);
  const totalTax = retirementYears.reduce((sum, y) => sum + (y.totalTax || 0), 0);
  const totalAfterTaxIncome = retirementYears.reduce((sum, y) => sum + (y.afterTaxIncome || 0), 0);

  const effectiveTaxRate = totalGrossWithdrawal > 0 ? (totalTax / totalGrossWithdrawal) * 100 : 0;

  // Calculate RMD totals
  const totalRMD = retirementYears.reduce((sum, y) => sum + (y.rmdAmount || 0), 0);
  const yearsWithRMD = retirementYears.filter(y => y.rmdRequired).length;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tax Optimization Summary
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Current Strategy (No Roth Conversions)
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Total Gross Withdrawals</TableCell>
                <TableCell align="right">${totalGrossWithdrawal.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Federal Income Tax</TableCell>
                <TableCell align="right">${totalFederalTax.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>State Income Tax</TableCell>
                <TableCell align="right">${totalStateTax.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Capital Gains Tax</TableCell>
                <TableCell align="right">${totalCapitalGainsTax.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>NIIT (3.8%)</TableCell>
                <TableCell align="right">${totalNIIT.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: 'error.light' }}>
                <TableCell><strong>Total Taxes</strong></TableCell>
                <TableCell align="right"><strong>${totalTax.toLocaleString()}</strong></TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: 'success.light' }}>
                <TableCell><strong>After-Tax Income</strong></TableCell>
                <TableCell align="right"><strong>${totalAfterTaxIncome.toLocaleString()}</strong></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Effective Tax Rate</TableCell>
                <TableCell align="right">{effectiveTaxRate.toFixed(1)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Required Minimum Distributions
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Total RMDs Over Retirement</TableCell>
                <TableCell align="right">${totalRMD.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Years Subject to RMD</TableCell>
                <TableCell align="right">{yearsWithRMD} years</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, bgcolor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom>
          Optimization Tips
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Roth Conversion Strategy:</strong> Consider converting Traditional IRA funds to Roth IRA during
          low-income years (typically early retirement before RMDs begin at age 73). This reduces future RMDs and
          provides tax-free growth, though conversions are taxed as ordinary income in the conversion year.
        </Typography>
        <Typography variant="body2" paragraph>
          <strong>Tax-Loss Harvesting:</strong> In taxable accounts, realize losses to offset capital gains.
          Up to $3,000 of net losses can offset ordinary income annually.
        </Typography>
        <Typography variant="body2">
          <strong>Asset Location:</strong> Hold tax-inefficient assets (bonds, REITs) in tax-advantaged accounts
          and tax-efficient assets (stocks, ETFs) in taxable accounts.
        </Typography>
      </Paper>
    </Box>
  );
};
