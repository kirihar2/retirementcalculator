import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box } from '@mui/material';
import type { ProjectionYear } from '../../types';

interface RMDScheduleTableProps {
  projection: ProjectionYear[];
  retirementAge: number;
}

export const RMDScheduleTable: React.FC<RMDScheduleTableProps> = ({ projection, retirementAge }) => {
  // Filter projection to years where RMDs apply (age 73+)
  const rmdYears = projection.filter(year => year.age >= 73 && year.traditionalBalance !== undefined);

  if (rmdYears.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No RMD data available. Enter account breakdowns to see RMD projections.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Required Minimum Distributions (RMDs)
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        RMDs are calculated starting at age 73 (or 75 if born after 1959) based on IRS Uniform Lifetime Table.
        These distributions are required from Traditional retirement accounts and are taxed as ordinary income.
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Age</TableCell>
              <TableCell>Year</TableCell>
              <TableCell align="right">RMD Amount</TableCell>
              <TableCell align="right">Traditional Balance</TableCell>
              <TableCell align="right">RMD Required</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rmdYears.map((year) => {
              const currentYear = new Date().getFullYear();
              const projectionYear = currentYear + (year.age - (projection[0]?.age || currentYear));
              const rmdAmount = year.rmdAmount || 0;
              const rmdRequired = year.rmdRequired || false;

              return (
                <TableRow key={year.age} sx={{ bgcolor: rmdRequired ? 'warning.light' : 'inherit' }}>
                  <TableCell>{year.age}</TableCell>
                  <TableCell>{projectionYear}</TableCell>
                  <TableCell align="right">
                    {rmdAmount > 0 ? `$${rmdAmount.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {year.traditionalBalance ? `$${year.traditionalBalance.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell align="right">
                    {rmdRequired ? 'Yes' : 'No'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Note: RMD calculations assume birth year based on current age. Rows highlighted in yellow indicate years where RMDs are required.
        </Typography>
      </Box>
    </Box>
  );
};
