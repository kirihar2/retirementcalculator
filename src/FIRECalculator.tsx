import React, { useCallback, useEffect, useState } from 'react';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import { Box, Button, Container, CssBaseline, Divider, InputLabel, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Header } from './components/Header';
import { Scoreboard } from './components/Scoreboard';
import { DisplayModeToggle } from './components/DisplayModeToggle';
import { Footer } from './components/Footer';
import { PortfolioChart } from './components/PortfolioChart';
import { ActualVsProjectedChart } from './components/ActualVsProjectedChart';
import type {
  AnnualActuals,
  DebtPayment,
  InputState,
  LifeEvent,
  Pension,
  ProjectedMilestone,
  ProjectionYear,
} from './types';
import { aggregatePensions, calculateProjection } from './utils/calculations';

// Import hooks for state management
import { useActuals } from './hooks/useActuals';
import { useDebtPayments } from './hooks/useDebtPayments';
import { useLifeEvents } from './hooks/useLifeEvents';
import { useMilestones } from './hooks/useMilestones';
import { usePensions } from './hooks/usePensions';

// Controlled child components (use state passed as read-only props)
import { PersonalDetailsControlled } from './components/internal/PersonalDetailsControlled';
import { FinancialDetailsControlled } from './components/internal/FinancialDetailsControlled';
import { RetirementPlanControlled } from './components/internal/RetirementPlanControlled';
import { HealthCareControlled } from './components/internal/HealthCareControlled';
import { ReturnsAndInflationControlled } from './components/internal/ReturnsAndInflationControlled';

// Section components for standalone display in projection table
import { PensionsControlled } from './components/internal/PensionsControlled';
import { LifeEventsControlled } from './components/internal/LifeEventsControlled';
import { DebtPaymentsControlled } from './components/internal/DebtPaymentsControlled';
import { MilestonesControlled } from './components/internal/MilestonesControlled';
import { VariableInflationControlled } from './components/internal/VariableInflationControlled';
import { ActualsSection } from './components/ActualsSection';
import { Milestones } from './components/Milestones';
import { ProjectionTable } from './components/ProjectionTable';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
  },
  typography: {
    fontFamily: '"DM Mono", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

/**
 * FIRE Calculator - Dashboard Application
 *
 * This component calculates your path to financial independence (FIRE)
 * and visualizes your portfolio growth over time. It uses hooks for
 * state management and controlled children pattern for input sections.
 *
 * Key Features:
 * - Compound interest projections with configurable return rates
 * - Spending inflation tracking
 * - Safe withdrawal rate-based FIRE target calculation
 * - Social Security and pension income integration
 * - Life events (daycare, college) expense modeling
 * - Debt payments (mortgage, loans) tracking
 * - Health care cost estimation before Medicare
 * - Coasting mode for reducing burnout
 */
export default function FIRECalculator() {
  // Initial consolidated state - persists to localStorage
  const initialState: InputState = {
    currentAge: 32,
    retirementAge: 52,
    lifeExpectancy: 95,
    currentPortfolio: 555000,
    monthlyIncome: 22500,
    monthlySpending: 4000,
    retirementSpending: 15000,
    spendingCategories: [],
    preRetirementReturn: 10,
    coastingReturn: 10,
    retirementReturn: 6,
    inflationRate: 3,
    socialSecurityAge: 65,
    socialSecurityIncome: 60000,
    safeWithdrawalRate: 3.5,
    medicareAge: 65,
    healthCareMonthly: 2000,
    coastingMode: { enabled: false, coastingAge: 50, coasingMultiplier: 0.75 },
  };

  // === HOOKS FOR STATE MANAGEMENT ===
  // Main consolidated state - persists to localStorage (Phase 14)
  const [inputs, setInputs] = useState<InputState>(initialState);

  // Persist inputs state to localStorage
  useEffect(() => {
    localStorage.setItem('fire_input_state', JSON.stringify(inputs));
  }, [inputs]);

  // Load inputs from localStorage on mount (only once)
  useEffect(() => {
    const savedInputs = localStorage.getItem('fire_input_state');
    if (savedInputs) {
      try {
        const parsed = JSON.parse(savedInputs);
        setInputs(parsed);
      } catch (e) {
        console.error('Failed to parse input state from localStorage', e);
      }
    }
  }, []);

  // === USE PENSIONS HOOK ===
  const defaultPensions: Pension[] = [{ id: '1', name: 'Current Pension', currentAnnualPayout: 40000, startAge: 60, endAge: null }];
  const initialPensions: Pension[] = (() => {
    const s = localStorage.getItem('fire_pensions');
    if (s) { try { return JSON.parse(s) as Pension[]; } catch {} }
    return defaultPensions;
  })();
  const { pensions, addPension, updatePension, removePension } = usePensions(initialPensions);

  // Persist pensions to localStorage
  useEffect(() => {
    if (pensions.length > 0) {
      localStorage.setItem('fire_pensions', JSON.stringify(pensions));
    } else {
      localStorage.removeItem('fire_pensions');
    }
  }, [pensions]);

  // === USE LIFE EVENTS HOOK ===
  const defaultLifeEvents: LifeEvent[] = [
    { id: '1', name: 'Daycare (First Child)', type: 'limited', amount: 2000, startAge: 34, endAge: 39, description: 'Monthly expense for first child childcare' },
    { id: '2', name: 'Daycare (Second Child)', type: 'limited', amount: 1500, startAge: 36, endAge: 41, description: 'Monthly expense for second child childcare' },
    { id: '3', name: 'College savings 1', type: 'limited', amount: 400, startAge: 34, endAge: 52, description: 'Monthly expense for first child college' },
    { id: '4', name: 'College savings 2', type: 'limited', amount: 400, startAge: 36, endAge: 54, description: 'Monthly expense for second child college' },
    { id: '5', name: 'Masters or PHD?', type: 'limited', amount: 5000, startAge: 55, endAge: 59, description: 'Advanced degree savings' },
    { id: '6', name: 'Long term care', type: 'monthly', amount: 20000, startAge: 85, endAge: 95, description: 'Long term care expenses' },
    { id: '7', name: 'Travel', type: 'limited', amount: 20000, startAge: 52, endAge: 72, description: 'Travel' },
    { id: '8', name: 'Spending after travelling', type: 'monthly', amount: 10000, startAge: 72, description: 'Spending after travelling' },
  ];
  const initialLifeEvents: LifeEvent[] = (() => {
    const s = localStorage.getItem('fire_life_events');
    if (s) { try { return JSON.parse(s) as LifeEvent[]; } catch {} }
    return defaultLifeEvents;
  })();
  const { lifeEvents, addLifeEvent, updateLifeEvent, removeLifeEvent } = useLifeEvents(initialLifeEvents);

  // Persist life events to localStorage
  useEffect(() => {
    if (lifeEvents.length > 0) {
      localStorage.setItem('fire_life_events', JSON.stringify(lifeEvents));
    } else {
      localStorage.removeItem('fire_life_events');
    }
  }, [lifeEvents]);

  // === USE DEBT PAYMENTS HOOK ===
  const defaultDebtPayments: DebtPayment[] = [
    { id: '1', name: 'Mortgage', monthlyPayment: 4100, startAge: 32, endAge: 58, description: '30-year mortgage payment' },
    { id: '2', name: 'Auto', monthlyPayment: 1500, startAge: 32, endAge: 33, description: '1-year auto payment' },
    { id: '3', name: 'Student Loans', monthlyPayment: 700, startAge: 32, endAge: 35, description: '3-year student loan payment' },
  ];
  const initialDebtPayments: DebtPayment[] = (() => {
    const s = localStorage.getItem('fire_debt_payments');
    if (s) { try { return JSON.parse(s) as DebtPayment[]; } catch {} }
    return defaultDebtPayments;
  })();
  const { debtPayments, addDebtPayment, updateDebtPayment, removeDebtPayment } = useDebtPayments(initialDebtPayments);

  // Persist debt payments to localStorage
  useEffect(() => {
    if (debtPayments.length > 0) {
      localStorage.setItem('fire_debt_payments', JSON.stringify(debtPayments));
    } else {
      localStorage.removeItem('fire_debt_payments');
    }
  }, [debtPayments]);

  // === USE MILESTONES HOOK ===
  const initialMilestones = (() => {
    const s = localStorage.getItem('fire_projected_milestones');
    if (s) { try { return JSON.parse(s); } catch {} }
    return [];
  })();
  const { projectedMilestones, addProjectedMilestone, updateProjectedMilestone, removeProjectedMilestone } = useMilestones(initialMilestones);

  // Persist milestones to localStorage
  useEffect(() => {
    if (projectedMilestones.length > 0) {
      localStorage.setItem('fire_projected_milestones', JSON.stringify(projectedMilestones));
    } else {
      localStorage.removeItem('fire_projected_milestones');
    }
  }, [projectedMilestones]);

  // === USE ACTUALS HOOK ===
  const initialActuals = (() => {
    const s = localStorage.getItem('fire_actuals');
    if (s) { try { return JSON.parse(s); } catch {} }
    return [];
  })();
  const { actuals, addActual, updateActual, removeActual } = useActuals(initialActuals);

  // Persist actuals to localStorage
  useEffect(() => {
    if (actuals.length > 0) {
      localStorage.setItem('fire_actuals', JSON.stringify(actuals));
    } else {
      localStorage.removeItem('fire_actuals');
    }
  }, [actuals]);



  // === COASTING MODE STATE ===
  const [coastingMode, setCoastingMode] = useState({ enabled: false, coastingAge: 50, coasingMultiplier: 0.75 });

  // Persist coasting mode to localStorage
  useEffect(() => {
    localStorage.setItem('fire_coasting_mode', JSON.stringify(coastingMode));
  }, [coastingMode]);

  // Load coasting mode from localStorage on mount
  useEffect(() => {
    const savedCoasting = localStorage.getItem('fire_coasting_mode');
    if (savedCoasting) {
      try {
        setCoastingMode(JSON.parse(savedCoasting));
      } catch (e) {
        console.error('Failed to parse coasting mode from localStorage', e);
      }
    }
  }, []);

  // === VARIABLE INFLATION STATE ===
  const [variableInflationRates, setVariableInflationRates] = useState<Array<{ id: string; age: number; rate: number }>>([]);

  // Persist variable inflation rates to localStorage
  useEffect(() => {
    if (variableInflationRates.length > 0) {
      localStorage.setItem('fire_variable_inflation_rates', JSON.stringify(variableInflationRates));
    } else {
      localStorage.removeItem('fire_variable_inflation_rates');
    }
  }, [variableInflationRates]);

  // Load variable inflation rates from localStorage on mount
  useEffect(() => {
    const savedInflation = localStorage.getItem('fire_variable_inflation_rates');
    if (savedInflation) {
      try {
        setVariableInflationRates(JSON.parse(savedInflation));
      } catch (e) {
        console.error('Failed to parse variable inflation rates from localStorage', e);
      }
    }
  }, []);

  // === RESET FUNCTION ===
  const resetAllData = () => {
    ['fire_actuals', 'fire_initial_actuals', 'fire_pensions', 'fire_life_events',
      'fire_debt_payments', 'fire_projected_milestones', 'fire_variable_inflation_rates',
      'fire_coasting_mode', 'fire_input_state'].forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  // === EXPORT/IMPORT FUNCTIONS ===
  const exportData = () => {
    const dataToExport = {
      inputs,
      pensions,
      lifeEvents,
      debtPayments,
      projectedMilestones,
      actuals,
      coastingMode,
      variableInflationRates,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fire-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFileChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text);
        if (parsed.inputs) localStorage.setItem('fire_input_state', JSON.stringify(parsed.inputs));
        if (parsed.actuals) localStorage.setItem('fire_actuals', JSON.stringify(parsed.actuals));
        if (parsed.pensions) localStorage.setItem('fire_pensions', JSON.stringify(parsed.pensions));
        if (parsed.lifeEvents) localStorage.setItem('fire_life_events', JSON.stringify(parsed.lifeEvents));
        if (parsed.debtPayments) localStorage.setItem('fire_debt_payments', JSON.stringify(parsed.debtPayments));
        if (parsed.projectedMilestones) localStorage.setItem('fire_projected_milestones', JSON.stringify(parsed.projectedMilestones));
        if (parsed.coastingMode) localStorage.setItem('fire_coasting_mode', JSON.stringify(parsed.coastingMode));
        if (parsed.variableInflationRates) localStorage.setItem('fire_variable_inflation_rates', JSON.stringify(parsed.variableInflationRates));
        window.location.reload();
      } catch (error) {
        console.error('Failed to import data', error);
        alert('Failed to parse backup file. Please ensure it was exported correctly.');
      }
    };
    reader.readAsText(file);
  };

  // === COMPUTED VALUES FOR SCOREBOARD ===
  const [fireTarget, setFireTarget] = useState(0);
  const [fireAgeAchieved, setFireAgeAchieved] = useState<number | null>(null);

  // Projection effect runs on all input changes (intentional - reactive forms)
  useEffect(() => {
    const projectionResult = calculateProjection(
      inputs.currentAge,
      inputs.retirementAge,
      inputs.lifeExpectancy,
      inputs.currentPortfolio,
      inputs.monthlyIncome,
      inputs.monthlySpending,
      inputs.retirementSpending,
      inputs.preRetirementReturn,
      coastingMode.coasingMultiplier, // Use coasingMultiplier directly from coasting mode
      inputs.retirementReturn,
      inputs.inflationRate,
      inputs.socialSecurityAge,
      inputs.socialSecurityIncome,
      inputs.safeWithdrawalRate,
      inputs.medicareAge,
      inputs.healthCareMonthly,
      lifeEvents,
      debtPayments,
      pensions, // Pass actual pensions so they're included in calculations
      coastingMode,
      actuals,
      inputs.spendingCategories,
      variableInflationRates ? variableInflationRates.map(v => ({ age: v.age, rate: v.rate })) : []
    );

    setFireTarget(projectionResult.fireTarget);
    setFireAgeAchieved(projectionResult.fireAgeAchieved);
  }, [
    inputs.currentAge, inputs.retirementAge, inputs.lifeExpectancy,
    inputs.currentPortfolio, inputs.monthlyIncome, inputs.monthlySpending,
    inputs.retirementSpending, inputs.preRetirementReturn, coastingMode.coasingMultiplier,
    inputs.retirementReturn, inputs.inflationRate, inputs.socialSecurityAge,
    inputs.socialSecurityIncome, inputs.safeWithdrawalRate, inputs.medicareAge,
    inputs.healthCareMonthly, lifeEvents, debtPayments, pensions, coastingMode,
    actuals, inputs.spendingCategories, variableInflationRates,
  ]);

  // === ANNUAL SURPLUS CALCULATION ===
  const calculateAnnualSurplus = useCallback(() => {
    // Check if we're in the coasting period (working with reduced income)
    const isInCoastingPeriod = coastingMode.enabled && inputs.currentAge >= coastingMode.coastingAge && inputs.currentAge < inputs.retirementAge;

    let annualSurplus: number = (isInCoastingPeriod ? inputs.monthlyIncome * coastingMode.coasingMultiplier : inputs.monthlyIncome) - inputs.monthlySpending;

    // Subtract annual debt payments where currently active
    debtPayments.forEach((debt) => {
      if (inputs.currentAge >= debt.startAge && inputs.currentAge <= debt.endAge) {
        annualSurplus -= debt.monthlyPayment * 12;
      }
    });

    // Subtract current year's health care costs when before Medicare eligibility
    if (inputs.currentAge < inputs.medicareAge) {
      const yearsUntilMedicare = Math.max(0, inputs.medicareAge - inputs.currentAge);
      const yearsSinceRetirement = Math.max(0, inputs.currentAge - inputs.retirementAge);

      if (yearsUntilMedicare > 0 || yearsSinceRetirement >= 0) {
        annualSurplus -= inputs.healthCareMonthly * 12;
      }
    }

    return Math.round(annualSurplus);
  }, [inputs.currentAge, inputs.monthlyIncome, inputs.monthlySpending, debtPayments, inputs.medicareAge, inputs.healthCareMonthly, inputs.retirementAge, coastingMode]);

  const annualSurplus = calculateAnnualSurplus();

  // === DISPLAY MODE STATE ===
  const [displayMode, setDisplayMode] = useState<'real' | 'nominal'>('real');

  // Calculate projection for charts and scoreboard
  const projection = useProjectionState(
    inputs.currentAge, inputs.retirementAge, inputs.lifeExpectancy,
    inputs.currentPortfolio, inputs.monthlyIncome, inputs.monthlySpending,
    inputs.retirementSpending, inputs.preRetirementReturn, coastingMode.coasingMultiplier,
    inputs.retirementReturn, inputs.inflationRate, inputs.socialSecurityAge,
    inputs.socialSecurityIncome, inputs.safeWithdrawalRate, inputs.medicareAge,
    inputs.healthCareMonthly, lifeEvents, debtPayments, pensions,
    coastingMode, actuals, inputs.spendingCategories ?? [], variableInflationRates
  );

  // Get projected value at a given age (handles display mode)
  const getProjectedValueAtAge = useCallback((age: number): number | undefined => {
    return displayMode === 'nominal'
      ? projection.find(p => p.age === age)?.portfolioAfterInflation
      : projection.find(p => p.age === age)?.portfolio;
  }, [displayMode, projection]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <Header />

        <Container maxWidth="lg" sx={{ pb: 6 }}>
          {/* Scoreboard */}
          <Scoreboard
            fireTarget={fireTarget}
            currentPortfolio={inputs.currentPortfolio}
            annualSaving={annualSurplus}
            fireAgeAchieved={fireAgeAchieved}
            currentAge={inputs.currentAge}
            safeWithdrawalRate={inputs.safeWithdrawalRate}
            pensionSummary={aggregatePensions(pensions)}
            socialSecurityIncome={inputs.socialSecurityIncome}
          />

          {/* Main Content Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3, mb: 6 }}>
            {/* Left Sidebar - Inputs using controlled children pattern (Phase 15) */}
            <Box>
              <PersonalDetailsControlled
                currentAge={inputs.currentAge}
                retirementAge={inputs.retirementAge}
                lifeExpectancy={inputs.lifeExpectancy}
                onCurrentAgeChange={(age) => setInputs(prev => ({ ...prev, currentAge: age }))}
                onRetirementAgeChange={(age) => setInputs(prev => ({ ...prev, retirementAge: age }))}
                onLifeExpectancyChange={(age) => setInputs(prev => ({ ...prev, lifeExpectancy: age }))}
              />

              <FinancialDetailsControlled
                currentPortfolio={inputs.currentPortfolio}
                monthlyIncome={inputs.monthlyIncome}
                monthlySpending={inputs.monthlySpending}
                onCurrentPortfolioChange={(amount) => setInputs(prev => ({ ...prev, currentPortfolio: amount }))}
                onMonthlyIncomeChange={(income) => setInputs(prev => ({ ...prev, monthlyIncome: income }))}
                onMonthlySpendingChange={(spending) => setInputs(prev => ({ ...prev, monthlySpending: spending }))}
              />

              <RetirementPlanControlled
                retirementSpending={inputs.retirementSpending}
                socialSecurityAge={inputs.socialSecurityAge}
                socialSecurityIncome={inputs.socialSecurityIncome}
                safeWithdrawalRate={inputs.safeWithdrawalRate}
                onRetirementSpendingChange={(spending) => setInputs(prev => ({ ...prev, retirementSpending: spending }))}
                onSSAgeChange={(age) => setInputs(prev => ({ ...prev, socialSecurityAge: age }))}
                onSSIncomeChange={(income) => setInputs(prev => ({ ...prev, socialSecurityIncome: income }))}
                onSWRChange={(rate) => setInputs(prev => ({ ...prev, safeWithdrawalRate: rate }))}
              />

              <HealthCareControlled
                medicareAge={inputs.medicareAge}
                healthCareMonthly={inputs.healthCareMonthly}
                setMedicareAge={(age) => setInputs(prev => ({ ...prev, medicareAge: age }))}
                setHealthCareMonthly={(amount) => setInputs(prev => ({ ...prev, healthCareMonthly: amount }))}
              />

              <ReturnsAndInflationControlled
                preRetirementReturn={inputs.preRetirementReturn}
                coastingReturn={coastingMode.coasingMultiplier * 100 / 0.75} // Approximate coasting return from multiplier
                retirementReturn={inputs.retirementReturn}
                inflationRate={inputs.inflationRate}
                onPreRetirementReturnChange={(rate) => setInputs(prev => ({ ...prev, preRetirementReturn: rate }))}
                onCoastingReturnChange={(rate) => setInputs(prev => ({ ...prev, coastingReturn: rate * 10 }))} // Simplified
                onRetirementReturnChange={(rate) => setInputs(prev => ({ ...prev, retirementReturn: rate }))}
                onInflationRateChange={(rate) => setInputs(prev => ({ ...prev, inflationRate: rate }))}
              />

              {/* Section Components for standalone display */}
              <PensionsControlled
                pensions={pensions}
                onAdd={() => addPension({ name: 'New Pension', currentAnnualPayout: 0, startAge: 65 })}
                onUpdate={(id, updates) => updatePension(id, updates)}
                onDelete={(id) => removePension(id)}
              />

              <LifeEventsControlled
                lifeEvents={lifeEvents}
                onAdd={() => addLifeEvent({ name: 'New Event', type: 'one-time', amount: 0, startAge: inputs.currentAge, description: '' })}
                onUpdate={(id, updates) => updateLifeEvent(id, updates)}
                onDelete={(id) => removeLifeEvent(id)}
              />

              <DebtPaymentsControlled
                debtPayments={debtPayments}
                onAdd={() => addDebtPayment({ name: 'New Debt', monthlyPayment: 0, startAge: inputs.currentAge, endAge: inputs.currentAge + 5, description: '' })}
                onUpdate={(id, updates) => updateDebtPayment(id, updates)}
                onDelete={(id) => removeDebtPayment(id)}
              />

              <MilestonesControlled
                projectedMilestones={projectedMilestones}
                onAdd={() => addProjectedMilestone({ age: inputs.currentAge + 5, event: 'New Milestone', category: 'event' })}
                onUpdate={(id, updates) => updateProjectedMilestone(id, updates)}
                onDelete={(id) => removeProjectedMilestone(id)}
              />

              <VariableInflationControlled
                variableInflationRates={variableInflationRates}
                inflationRate={inputs.inflationRate}
                onAdd={() => {
                  const newEntry = { id: Date.now().toString(), age: inputs.currentAge + 5, rate: inputs.inflationRate };
                  setVariableInflationRates([...variableInflationRates, newEntry]);
                }}
                onUpdate={(id, updates) => {
                  setVariableInflationRates(variableInflationRates.map(e => e.id === id ? { ...e, ...updates } : e));
                }}
                onDelete={(id) => setVariableInflationRates(variableInflationRates.filter(e => e.id !== id))}
              />

              {/* Coasting mode controls */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>Coasting Mode</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <input
                    type="checkbox"
                    checked={coastingMode.enabled}
                    onChange={(e) => setCoastingMode(prev => ({ ...prev, enabled: e.target.checked }))}
                    id="coasting-enabled"
                  />
                  <label htmlFor="coasting-enabled">Enable</label>
                </Box>
                <NumericInputSmall label="Starting Age" value={coastingMode.coastingAge} onChange={(v) => setCoastingMode(prev => ({ ...prev, coastingAge: v }))} min={18} max={inputs.retirementAge - 5} />
                <NumericInputSmall label="Income Multiplier (0.5-1.0)" value={coastingMode.coasingMultiplier} onChange={(v) => setCoastingMode(prev => ({ ...prev, coasingMultiplier: Math.max(0.5, Math.min(1, v)) }))} min={0.5} max={1} step={0.05} />
              </Box>

              {/* Reset button */}
              <Button variant="outlined" size="small" onClick={resetAllData} sx={{ mt: 2 }}>
                Reset All Data
              </Button>
            </Box>

            {/* Right Content - Charts and Results */}
            <Box>
              <DisplayModeToggle displayMode={displayMode} onChange={setDisplayMode} />

              <PortfolioChart
                projection={projection}
                fireTarget={fireTarget}
                displayMode={displayMode}
              />

              {actuals.length > 0 && (
                <ActualVsProjectedChart
                  projection={projection}
                  actual={actuals}
                  displayMode={displayMode}
                />
              )}

              <Milestones
                retirementAge={inputs.retirementAge}
                socialSecurityAge={inputs.socialSecurityAge}
                socialSecurityIncome={inputs.socialSecurityIncome}
                medicareAge={inputs.medicareAge}
                projectedMilestones={projectedMilestones}
                onUpdateMilestone={(id, updates) => updateProjectedMilestone(id, updates)}
                onRemoveMilestone={removeProjectedMilestone}
                getProjectedValueAtAge={getProjectedValueAtAge}
              />

              {/* Export/Import */}
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Data Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button variant="contained" size="small" onClick={exportData}>
                    Export All Data
                  </Button>
                  <InputLabel htmlFor="import-file">Import</InputLabel>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={importFileChangeHandler}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      const input = document.getElementById('import-file') as HTMLInputElement;
                      input?.click();
                    }}
                  >
                    Choose Backup File
                  </Button>
                </Box>
              </Box>

            </Box>
          </Box>

          {/* Life Events Section (standalone) */}
          <Box sx={{ mb: 6 }}>
            <LifeEventsControlled
              lifeEvents={lifeEvents}
              onAdd={() => {}} // Not used here, section handles display only
              onUpdate={(id, updates) => updateLifeEvent(id, updates)}
              onDelete={(id) => removeLifeEvent(id)}
            />
          </Box>

          {/* Debt Payments Section (standalone) */}
          <Box sx={{ mb: 6 }}>
            <DebtPaymentsControlled
              debtPayments={debtPayments}
              onAdd={() => {}} // Not used here, section handles display only
              onUpdate={(id, updates) => updateDebtPayment(id, updates)}
              onDelete={(id) => removeDebtPayment(id)}
            />
          </Box>

          {/* Actuals Section (standalone) */}
          <Box sx={{ mb: 6 }}>
            <ActualsSection
              actuals={actuals}
              onAddActual={(age) => addActual({ year: age, age, portfolio: 0, savings: 0, spending: 0 })}
              onUpdateActual={(age, updates) => updateActual(age, updates)}
              onRemoveActual={(age) => removeActual(age)}
            />
          </Box>

          {/* Projection Table */}
          <Box sx={{ mb: 6 }}>
            <ProjectionTable projection={projection} lifeEvents={lifeEvents} actual={actuals} />
          </Box>

          {actuals.length > 0 && (
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" size="small" onClick={resetAllData}>
                Reset All Actuals Data
              </Button>
            </Box>
          )}

        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

/**
 * Simplified numeric input component for smaller controls.
 */
const NumericInputSmall: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}> = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      <span style={{ fontSize: 12, minWidth: 120 }}>{label}</span>
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
 * Hook for calculating projection state (exposed here for scoreboard).
 * In production, move this logic into a separate calculation module.
 */
function useProjectionState(
  currentAge: number, retirementAge: number, lifeExpectancy: number,
  currentPortfolio: number, monthlyIncome: number, monthlySpending: number,
  retirementSpending: number, preRetirementReturn: number, coastingReturn: number,
  retirementReturn: number, inflationRate: number, socialSecurityAge: number,
  socialSecurityIncome: number, safeWithdrawalRate: number, medicareAge: number,
  healthCareMonthly: number, lifeEvents: LifeEvent[], debtPayments: DebtPayment[],
  pensions: Pension[], coastingMode: { enabled: boolean; coastingAge: number; coasingMultiplier: number },
  actuals: AnnualActuals[], spendingCategories: any[], variableInflationRates: Array<{ age: number; rate: number }>
) {
  // This is a simplified hook version of calculateProjection.
  // In production, consider moving this to a separate module for better organization.
  const { projection: newProjection } = calculateProjection(
    currentAge, retirementAge, lifeExpectancy,
    currentPortfolio, monthlyIncome, monthlySpending,
    retirementSpending, preRetirementReturn, coastingReturn,
    retirementReturn, inflationRate, socialSecurityAge,
    socialSecurityIncome, safeWithdrawalRate, medicareAge,
    healthCareMonthly, lifeEvents, debtPayments, pensions,
    coastingMode, actuals, spendingCategories, variableInflationRates
  );
  return newProjection;
}
