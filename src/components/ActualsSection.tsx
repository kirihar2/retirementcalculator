import { useState } from 'react';
import { Box, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Menu, MenuItem } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { AnnualActuals } from '../types';

interface ActualsSectionProps {
  actuals: AnnualActuals[];
  onAddActual: (age: number) => void;
  onUpdateActual: (age: number, updates: Partial<Omit<AnnualActuals, 'age'>>) => void;
  onRemoveActual: (age: number) => void;
}

/**
 * Format a number for display in an input field.
 * Returns empty string for 0 to make it easy to start typing.
 */
function formatInputValue(value: number): string {
  return value === 0 ? '' : String(value);
}

/**
 * Format an age for display. Shows "mid-year" for .5 values.
 */
function formatAge(age: number): string {
  if (Number.isInteger(age)) return `Age ${age}`;
  const whole = Math.floor(age);
  const fraction = age - whole;
  if (Math.abs(fraction - 0.5) < 0.01) return `Age ${whole} (mid-year)`;
  return `Age ${age.toFixed(1)}`;
}

export function ActualsSection({ actuals, onAddActual, onUpdateActual, onRemoveActual }: ActualsSectionProps) {
  const sorted = [...actuals].sort((a, b) => a.age - b.age);
  const nextAge = sorted.length > 0 ? sorted[sorted.length - 1].age + 1 : 32;

  // Add menu state
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [customAge, setCustomAge] = useState('');
  const [showCustomAge, setShowCustomAge] = useState(false);

  const handleAddClick = (event: React.MouseEvent<HTMLElement>) => {
    setAddMenuAnchor(event.currentTarget);
  };

  const handleAddNext = () => {
    onAddActual(nextAge);
    setAddMenuAnchor(null);
  };

  const handleAddCustom = () => {
    setShowCustomAge(true);
    setAddMenuAnchor(null);
  };

  const handleCustomAgeSubmit = () => {
    const age = parseFloat(customAge);
    if (!isNaN(age) && age > 0 && age < 120) {
      onAddActual(age);
      setCustomAge('');
      setShowCustomAge(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Actual Data
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddClick}
            startIcon={<AddIcon />}
          >
            Add Entry
          </Button>
          <Menu
            anchorEl={addMenuAnchor}
            open={Boolean(addMenuAnchor)}
            onClose={() => setAddMenuAnchor(null)}
          >
            <MenuItem onClick={handleAddNext}>
              Add at age {nextAge} (next)
            </MenuItem>
            <MenuItem onClick={handleAddCustom}>
              Add at custom age (including historical)...
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Custom age input */}
      {showCustomAge && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2">Enter age:</Typography>
          <TextField
            type="number"
            size="small"
            value={customAge}
            onChange={(e) => setCustomAge(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomAgeSubmit(); if (e.key === 'Escape') setShowCustomAge(false); }}
            placeholder="e.g., 30 or 32.5 for mid-year"
            variant="outlined"
            autoFocus
            sx={{ width: 220, '& input': { padding: '6px 8px' } }}
            inputProps={{ min: 1, max: 120, step: 0.5 }}
          />
          <Button size="small" variant="contained" onClick={handleCustomAgeSubmit}>Add</Button>
          <Button size="small" onClick={() => setShowCustomAge(false)}>Cancel</Button>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Tip: Use decimal ages for mid-year check-ins (e.g., 32.5 for halfway through age 32). You can enter historical data for any past age.
      </Typography>

      {sorted.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No actual data recorded. Click &quot;Add Entry&quot; to start tracking your progress against projections.
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
                <TableCell sx={{ fontWeight: 'bold' }}>Comment</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((row) => (
                <ActualsRow
                  key={row.age}
                  row={row}
                  onUpdate={(updates) => onUpdateActual(row.age, updates)}
                  onRemove={() => onRemoveActual(row.age)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

/**
 * Individual row for an actual data entry.
 * Uses local state for text fields to allow free typing, committing on blur.
 */
function ActualsRow({
  row,
  onUpdate,
  onRemove,
}: {
  row: AnnualActuals;
  onUpdate: (updates: Partial<Omit<AnnualActuals, 'age'>>) => void;
  onRemove: () => void;
}) {
  // Local state for text fields so users can type freely
  const [portfolio, setPortfolio] = useState(formatInputValue(row.portfolio));
  const [savings, setSavings] = useState(formatInputValue(row.savings));
  const [spending, setSpending] = useState(formatInputValue(row.spending));
  const [comment, setComment] = useState(row.comment || '');

  const commitPortfolio = () => {
    const val = parseFloat(portfolio);
    const committed = isNaN(val) ? 0 : val;
    onUpdate({ portfolio: committed });
    setPortfolio(formatInputValue(committed));
  };
  const commitSavings = () => {
    const val = parseFloat(savings);
    const committed = isNaN(val) ? 0 : val;
    onUpdate({ savings: committed });
    setSavings(formatInputValue(committed));
  };
  const commitSpending = () => {
    const val = parseFloat(spending);
    const committed = isNaN(val) ? 0 : val;
    onUpdate({ spending: committed });
    setSpending(formatInputValue(committed));
  };
  const commitComment = () => {
    onUpdate({ comment: comment.trim() || undefined });
  };

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatAge(row.age)}
        </Typography>
      </TableCell>
      <TableCell align="right">
        <TextField
          type="number"
          size="small"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          onBlur={commitPortfolio}
          onKeyDown={(e) => { if (e.key === 'Enter') commitPortfolio(); }}
          placeholder="0"
          variant="outlined"
          sx={{ width: 130, '& input': { textAlign: 'right', padding: '6px 8px' } }}
        />
      </TableCell>
      <TableCell align="right">
        <TextField
          type="number"
          size="small"
          value={savings}
          onChange={(e) => setSavings(e.target.value)}
          onBlur={commitSavings}
          onKeyDown={(e) => { if (e.key === 'Enter') commitSavings(); }}
          placeholder="0"
          variant="outlined"
          sx={{ width: 130, '& input': { textAlign: 'right', padding: '6px 8px' } }}
        />
      </TableCell>
      <TableCell align="right">
        <TextField
          type="number"
          size="small"
          value={spending}
          onChange={(e) => setSpending(e.target.value)}
          onBlur={commitSpending}
          onKeyDown={(e) => { if (e.key === 'Enter') commitSpending(); }}
          placeholder="0"
          variant="outlined"
          sx={{ width: 130, '& input': { textAlign: 'right', padding: '6px 8px' } }}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onBlur={commitComment}
          placeholder="Add a note..."
          variant="outlined"
          sx={{ width: 180, '& input': { padding: '6px 8px' } }}
        />
      </TableCell>
      <TableCell>
        <IconButton size="small" onClick={onRemove} color="error">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
