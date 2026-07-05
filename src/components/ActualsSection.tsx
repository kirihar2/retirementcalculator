import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { AnnualActuals } from '../types';

interface ActualsSectionProps {
  actuals: AnnualActuals[];
  onAddActual: (age: number) => void;
  onUpdateActual: (age: number, updates: Partial<AnnualActuals>) => void;
  onRemoveActual: (age: number) => void;
}

export function ActualsSection({ actuals, onAddActual, onUpdateActual, onRemoveActual }: ActualsSectionProps) {
  const sorted = [...actuals].sort((a, b) => a.age - b.age);
  const nextAge = sorted.length > 0 ? sorted[sorted.length - 1].age + 1 : 32;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Actual Data
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onAddActual(nextAge)}
        >
          + Add Year
        </Button>
      </Box>

      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No actual data recorded. Add actual portfolio values to compare against projections.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={1}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Portfolio ($)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Savings ($)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Spending ($)</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.age}>
                  <TableCell>
                    <TextField
                      type="number"
                      size="small"
                      value={row.age}
                      onChange={(e) => onUpdateActual(row.age, { age: parseInt(e.target.value) || row.age })}
                      inputProps={{ min: 1, max: 120, style: { width: 60, padding: '4px 8px' } }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.portfolio}
                      onChange={(e) => onUpdateActual(row.age, { portfolio: parseFloat(e.target.value) || 0 })}
                      inputProps={{ style: { width: 100, padding: '4px 8px', textAlign: 'right' } }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.savings}
                      onChange={(e) => onUpdateActual(row.age, { savings: parseFloat(e.target.value) || 0 })}
                      inputProps={{ style: { width: 100, padding: '4px 8px', textAlign: 'right' } }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      value={row.spending}
                      onChange={(e) => onUpdateActual(row.age, { spending: parseFloat(e.target.value) || 0 })}
                      inputProps={{ style: { width: 100, padding: '4px 8px', textAlign: 'right' } }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => onRemoveActual(row.age)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
