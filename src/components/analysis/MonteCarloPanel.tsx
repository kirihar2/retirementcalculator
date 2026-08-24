import React, { useState, useMemo } from 'react';
import { Box, Button, Typography, LinearProgress, Chip } from '@mui/material';
import { MonteCarloUtils, type MonteCarloSimulationParams, type MonteCarloSimulationResult } from '../../types/monte-carlo';

/**
 * Monte Carlo Simulation Panel
 *
 * Allows users to configure and run Monte Carlo simulations,
 * displaying success probability, portfolio outcomes, and risk analysis.
 */
export interface MonteCarloPanelProps {
  // Current calculator values (pre-filled defaults)
  initialPortfolio: number;
  retirementAge: number;
  lifeExpectancy: number;
  monthlyWithdrawal: number;
  expectedReturn: number;            // percentage, e.g. 7
  currentAge: number;
  annualSavings: number;

  displayMode: 'nominal' | 'real';
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export function MonteCarloPanel({
  initialPortfolio,
  retirementAge,
  lifeExpectancy,
  monthlyWithdrawal,
  expectedReturn,
  currentAge,
  annualSavings,
  displayMode,
}: MonteCarloPanelProps) {
  const [iterations, setIterations] = useState(1000);
  const [volatility, setVolatility] = useState(15);   // percent
  const [results, setResults] = useState<MonteCarloSimulationResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const aggregateResult = useMemo(() => {
    if (!results) return null;
    return MonteCarloUtils.getAggregateResult(results);
  }, [results]);

  const runSimulation = () => {
    setIsRunning(true);
    setProgress(0);

    // Simulate progress updates during computation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 50);

    // Use setTimeout to avoid blocking UI thread
    setTimeout(() => {
      const params: MonteCarloSimulationParams = {
        initialPortfolio,
        retirementAge,
        lifeExpectancy,
        monthlyWithdrawal,
        defaultAnnualReturn: expectedReturn / 100,
        annualReturnVolatility: volatility / 100,
        currentAge,
        preRetirementReturn: expectedReturn / 100,
        annualSavings,
      };

      const simResults = MonteCarloUtils.runSimulation(params, iterations);

      clearInterval(progressInterval);
      setProgress(100);
      setResults(simResults);
      setIsRunning(false);

      // Reset progress after a brief delay
      setTimeout(() => setProgress(0), 1000);
    }, 100);
  };

  // Success probability color coding
  const getSuccessColor = (prob: number): 'success' | 'warning' | 'error' => {
    if (prob >= 80) return 'success';
    if (prob >= 60) return 'warning';
    return 'error';
  };

  const getSuccessLabel = (prob: number): string => {
    if (prob >= 90) return 'Very High';
    if (prob >= 80) return 'High';
    if (prob >= 70) return 'Good';
    if (prob >= 60) return 'Moderate';
    if (prob >= 50) return 'Uncertain';
    return 'At Risk';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
      {/* Title */}
      <Typography variant="h6" fontWeight="bold">
        Monte Carlo Simulation
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Run 1,000+ scenarios to estimate the probability your portfolio lasts through retirement.
      </Typography>

      {/* Input Parameters */}
      <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
        <Typography variant="caption" fontWeight="bold" display="block" sx={{ mb: 1 }}>
          Simulation Inputs ({displayMode === 'real' ? "Today's Dollars" : 'Future Dollars'}):
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Typography variant="caption">Starting Portfolio:</Typography>
          <Typography variant="caption" fontWeight="bold">{formatCurrency(initialPortfolio)}</Typography>
          <Typography variant="caption">Annual Savings:</Typography>
          <Typography variant="caption" fontWeight="bold">{formatCurrency(annualSavings)}</Typography>
          <Typography variant="caption">Retirement Withdrawal:</Typography>
          <Typography variant="caption" fontWeight="bold">{formatCurrency(monthlyWithdrawal * 12)}/yr (net of SS/pension)</Typography>
          <Typography variant="caption">Expected Return:</Typography>
          <Typography variant="caption" fontWeight="bold">{expectedReturn}%</Typography>
          <Typography variant="caption">Retirement Period:</Typography>
          <Typography variant="caption" fontWeight="bold">Age {retirementAge} to {lifeExpectancy} ({lifeExpectancy - retirementAge} years)</Typography>
        </Box>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
          {displayMode === 'real'
            ? 'All values are in today\'s purchasing power (inflation-adjusted)'
            : 'All values are in nominal future dollars (not adjusted for inflation)'}
        </Typography>
      </Box>

      {/* Configuration */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" display="block">Iterations</Typography>
          <select
            value={iterations}
            onChange={(e) => setIterations(Number(e.target.value))}
            style={{ padding: '4px 8px', fontSize: 14 }}
            disabled={isRunning}
          >
            <option value={500}>500 (fast)</option>
            <option value={1000}>1,000 (default)</option>
            <option value={5000}>5,000 (detailed)</option>
            <option value={10000}>10,000 (thorough)</option>
          </select>
        </Box>

        <Box>
          <Typography variant="caption" display="block">Volatility (risk)</Typography>
          <select
            value={volatility}
            onChange={(e) => setVolatility(Number(e.target.value))}
            style={{ padding: '4px 8px', fontSize: 14 }}
            disabled={isRunning}
          >
            <option value={10}>Low (10%)</option>
            <option value={15}>Moderate (15%)</option>
            <option value={20}>High (20%)</option>
            <option value={25}>Very High (25%)</option>
          </select>
        </Box>
      </Box>

      {/* Run Button */}
      <Button
        variant="contained"
        onClick={runSimulation}
        disabled={isRunning}
        sx={{ textTransform: 'none' }}
      >
        {isRunning ? 'Running Simulation...' : 'Run Simulation'}
      </Button>

      {/* Progress */}
      {isRunning && (
        <Box sx={{ width: '100%' }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="textSecondary">
            Running {iterations.toLocaleString()} iterations...
          </Typography>
        </Box>
      )}

      {/* Results */}
      {aggregateResult && !isRunning && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Success Probability */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold" color={`${getSuccessColor(aggregateResult.successProbability)}.main`}>
              {aggregateResult.successProbability.toFixed(1)}%
            </Typography>
            <Chip
              component="span"
              label={getSuccessLabel(aggregateResult.successProbability)}
              color={getSuccessColor(aggregateResult.successProbability)}
              size="small"
            />
            <Typography variant="body2" color="textSecondary">
              success probability
            </Typography>
          </Box>

          {/* Portfolio Outcomes */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="textSecondary">Max Portfolio</Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(aggregateResult.maxPortfolioValue)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">Median Outcome</Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(aggregateResult.medianFinalPortfolio)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">10th Percentile</Typography>
              <Typography variant="body1">
                {formatCurrency(aggregateResult.percentile10)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="textSecondary">90th Percentile</Typography>
              <Typography variant="body1">
                {formatCurrency(aggregateResult.percentile90)}
              </Typography>
            </Box>
          </Box>

          {/* Depletion Info */}
          {aggregateResult.portfolioAgeAtDeath !== undefined && (
            <Box sx={{ p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
              <Typography variant="body2" sx={{color: 'rgba(255,255,255,0.85)'}}>
                Average depletion age: {aggregateResult.portfolioAgeAtDeath.toFixed(1)} years old
              </Typography>
            </Box>
          )}

          {/* Interpretation */}
          <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="textSecondary" display="block">
              <strong>What this means:</strong>{' '}
              {aggregateResult.successProbability >= 80
                ? `Your plan looks solid. In ${aggregateResult.successProbability.toFixed(0)}% of simulated market scenarios, your portfolio lasts through age ${lifeExpectancy}.`
                : aggregateResult.successProbability >= 60
                ? `Your plan has moderate risk. Consider increasing savings or reducing spending to improve your success rate.`
                : `Your plan is at risk. Only ${aggregateResult.successProbability.toFixed(0)}% of scenarios succeed. Consider working longer, saving more, or spending less in retirement.`}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
