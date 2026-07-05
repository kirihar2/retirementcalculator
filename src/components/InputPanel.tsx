import React from 'react';
import { Box, Divider } from '@mui/material';
import { Typography } from '@mui/material';

// Controlled child components (use state passed as read-only props)
import { PersonalDetailsControlled } from './internal/PersonalDetailsControlled';
import { FinancialDetailsControlled } from './internal/FinancialDetailsControlled';
import { RetirementPlanControlled } from './internal/RetirementPlanControlled';
import { HealthCareControlled } from './internal/HealthCareControlled';
import { ReturnsAndInflationControlled } from './internal/ReturnsAndInflationControlled';

/**
 * Simplified numeric input component for smaller controls.
 */
const NumericInputSmall: React.FC<{
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ value, onChange, min = 0, max = 100, step = 1 }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        style={{ width: 60, padding: 4, fontSize: 12 }}
        min={min}
        max={max}
        step={step}
      />
    </Box>
  );
};

/**
 * InputPanel - Controlled version using new state pattern.
 *
 * This component manages input fields for the FIRE calculator.
 * All state is controlled by parent components through hooks.
 * Each section uses a controlled child component with read-only props.
 */
export const InputPanel: React.FC<{
  // Current personal details
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;

  // Financial details
  currentPortfolio: number;
  monthlyIncome: number;
  monthlySpending: number;

  // Retirement plan
  retirementSpending: number;
  socialSecurityAge: number;
  socialSecurityIncome: number;
  safeWithdrawalRate: number;

  // Health care before Medicare
  medicareAge: number;
  healthCareMonthly: number;

  // Returns and inflation
  preRetirementReturn: number;
  coastingReturn: number;
  retirementReturn: number;
  inflationRate: number;

  // Coasting mode settings
  coastingMode: { enabled: boolean; coastingAge: number; coasingMultiplier: number },

  // Optional: actual initial values for past year (if available)
  initialPortfolio?: number;
  initialSavings?: number;
  initialSpending?: number;

  // Handlers - all called through controlled children pattern
  onCurrentAgeChange: (age: number) => void;
  onRetirementAgeChange: (age: number) => void;
  onLifeExpectancyChange: (age: number) => void;

  onCurrentPortfolioChange: (amount: number) => void;
  onMonthlyIncomeChange: (income: number) => void;
  onMonthlySpendingChange: (spending: number) => void;

  onRetirementSpendingChange: (spending: number) => void;
  onSSAgeChange: (age: number) => void;
  onSSIncomeChange: (income: number) => void;
  onSWRChange: (rate: number) => void;

  setMedicareAge: (age: number) => void;
  setHealthCareMonthly: (amount: number) => void;

  onPreRetirementReturnChange: (rate: number) => void;
  onCoastingReturnChange: (rate: number) => void;
  onRetirementReturnChange: (rate: number) => void;
  onInflationRateChange: (rate: number) => void;

  // Coasting mode handlers
  onCoastingEnabledChange: (enabled: boolean) => void;
  onCoastingAgeChange: (age: number) => void;
  onCoastingMultiplierChange: (multiplier: number) => void;

  // Optional initial actuals handlers (if not passed, defaults to no-op)
  onInitialPortfolioChange?: (value: number) => void;
  onInitialSavingsChange?: (value: number) => void;
  onInitialSpendingChange?: (value: number) => void;
}> = ({
  // Personal details
  currentAge,
  retirementAge,
  lifeExpectancy,
  // Financial details
  currentPortfolio,
  monthlyIncome,
  monthlySpending,
  // Retirement plan
  retirementSpending,
  socialSecurityAge,
  socialSecurityIncome,
  safeWithdrawalRate,
  // Health care before Medicare
  medicareAge,
  healthCareMonthly,
  // Returns and inflation
  preRetirementReturn,
  coastingReturn,
  retirementReturn,
  inflationRate,
  // Coasting mode settings
  coastingMode: { enabled, coastingAge, coasingMultiplier },

  // Optional initial actuals values
  initialPortfolio,
  initialSavings,
  initialSpending,

  // Handlers - all state managed through hooks in parent component
  onCurrentAgeChange,
  onRetirementAgeChange,
  onLifeExpectancyChange,
  onCurrentPortfolioChange,
  onMonthlyIncomeChange,
  onMonthlySpendingChange,
  onRetirementSpendingChange,
  onSSAgeChange,
  onSSIncomeChange,
  onSWRChange,
  setMedicareAge,
  setHealthCareMonthly,
  onPreRetirementReturnChange,
  onCoastingReturnChange,
  onRetirementReturnChange,
  onInflationRateChange,
  // Coasting mode handlers
  onCoastingEnabledChange,
  onCoastingAgeChange,
  onCoastingMultiplierChange,

  // Optional initial actuals handlers (defaults to no-op)
  onInitialPortfolioChange = () => {},
  onInitialSavingsChange = () => {},
  onInitialSpendingChange = () => {},
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Personal Details Section */}
      <PersonalDetailsControlled
        currentAge={currentAge}
        retirementAge={retirementAge}
        lifeExpectancy={lifeExpectancy}
        onCurrentAgeChange={onCurrentAgeChange}
        onRetirementAgeChange={onRetirementAgeChange}
        onLifeExpectancyChange={onLifeExpectancyChange}
      />

      {/* Financial Details Section */}
      <FinancialDetailsControlled
        currentPortfolio={currentPortfolio}
        monthlyIncome={monthlyIncome}
        monthlySpending={monthlySpending}
        onCurrentPortfolioChange={onCurrentPortfolioChange}
        onMonthlyIncomeChange={onMonthlyIncomeChange}
        onMonthlySpendingChange={onMonthlySpendingChange}
      />

      {/* Retirement Plan Section */}
      <RetirementPlanControlled
        retirementSpending={retirementSpending}
        socialSecurityAge={socialSecurityAge}
        socialSecurityIncome={socialSecurityIncome}
        safeWithdrawalRate={safeWithdrawalRate}
        onRetirementSpendingChange={onRetirementSpendingChange}
        onSSAgeChange={onSSAgeChange}
        onSSIncomeChange={onSSIncomeChange}
        onSWRChange={onSWRChange}
      />

      {/* Health Care Before Medicare Section */}
      <HealthCareControlled
        medicareAge={medicareAge}
        healthCareMonthly={healthCareMonthly}
        setMedicareAge={setMedicareAge}
        setHealthCareMonthly={setHealthCareMonthly}
      />

      {/* Returns and Inflation Section */}
      <ReturnsAndInflationControlled
        preRetirementReturn={preRetirementReturn}
        coastingReturn={coastingReturn}
        retirementReturn={retirementReturn}
        inflationRate={inflationRate}
        onPreRetirementReturnChange={onPreRetirementReturnChange}
        onCoastingReturnChange={onCoastingReturnChange}
        onRetirementReturnChange={onRetirementReturnChange}
        onInflationRateChange={onInflationRateChange}
      />

      {/* Coasting Mode Section */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>Coasting Mode — Less Stressed Work Before Retirement</Typography>
        <Typography variant="body2" color="secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
          Want to take a less stressful job with lower pay before retiring?
          In coasting mode, you work until retirement age but with reduced income and savings contributions.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onCoastingEnabledChange(e.target.checked)}
            id="coasting-enabled"
          />
          <label htmlFor="coasting-enabled">Enable Coasting Mode</label>
        </Box>

        {enabled && (
          <>
            <NumericInputSmall
              label="Age to Start Coasting"
              value={coastingAge}
              onChange={onCoastingAgeChange}
              min={18}
              max={retirementAge - 5}
            />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, mr: 2 }}>Income Reduction (during coasting period)</Typography>
              <NumericInputSmall
                label={`Coasting Income Multiplier (${Math.round(coasingMultiplier * 100)}%)`}
                value={coasingMultiplier}
                onChange={onCoastingMultiplierChange}
                min={0.5}
                max={1}
                step={0.05}
              />
            </Box>

            <Typography variant="caption" color="secondary" sx={{ fontStyle: 'italic' }}>
              Tip: Use 0.6-0.8 if moving to a less demanding role, or keep at 1.0 if keeping similar income but wanting lower stress.
            </Typography>
          </>
        )}

        {/* Initial Actuals Section */}
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>Initial Actual (Past Year)</Typography>
          <Typography variant="body2" color="secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
            Enter your actual values for the past year to refine your projection.
          </Typography>

          {initialPortfolio !== undefined && (
            <>
              <NumericInputSmall
                label="Portfolio Balance at Year End"
                value={initialPortfolio}
                onChange={onInitialPortfolioChange}
                min={0}
                step={10000}
              />
              <NumericInputSmall
                label="Annual Savings (Contributions)"
                value={initialSavings || 0}
                onChange={onInitialSavingsChange}
                min={0}
                step={1000}
              />
              <NumericInputSmall
                label="Annual Spending"
                value={initialSpending || 0}
                onChange={onInitialSpendingChange}
                min={0}
                step={1000}
              />
            </>
          )}
        </Box>

      </Box>
    </Box>
  );
};
