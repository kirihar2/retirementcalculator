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
import zoomPlugin from 'chartjs-plugin-zoom';
import { Box, Button, Container, CssBaseline, Fab, Tooltip as MuiTooltip, Typography } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';

import { Header } from './components/layout/Header';
import { Scoreboard } from './components/scoreboard/Scoreboard';
import { DisplayModeToggle } from './components/scoreboard/DisplayModeToggle';
import { Footer } from './components/layout/Footer';
import { PortfolioChart } from './components/charts/PortfolioChart';
import { InputsDrawer } from './components/inputs/InputsDrawer';
import { AnalysisTabs } from './components/analysis/AnalysisTabs';
import { OnboardingWalkthrough } from './components/inputs/OnboardingWalkthrough';
import type {
  AnnualActuals,
  DebtPayment,
  InputState,
  LifeEvent,
  Pension,
  ProjectedMilestone,
} from './types';
import { aggregatePensions, calculateProjection } from './utils/calculations';
import { getEffectiveStrategy } from './components/analysis/WithdrawalStrategyConfig';

// Import hooks for state management
import { useActuals } from './hooks/useActuals';
import { useDebtPayments } from './hooks/useDebtPayments';
import { useLifeEvents } from './hooks/useLifeEvents';
import { useMilestones } from './hooks/useMilestones';
import { usePensions } from './hooks/usePensions';

// Import new theme
import theme from './theme';
// Cloud sync hook (no-op when auth is disabled)
import { useCloudSync } from './hooks/useCloudSync';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

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
  // Cloud sync hook: handles sign-in reconciliation, debounced push, and offline queueing.
  // No-op when VITE_ENABLE_AUTH is off.
  const cloudSync = useCloudSync();

  // Onboarding walkthrough state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('fire_has_seen_onboarding') !== 'true';
  });

  // Initial consolidated state - persists to localStorage
  const initialState: InputState = {
    currentAge: 0,
    retirementAge: 0,
    lifeExpectancy: 0,
    currentPortfolio: 0,
    monthlyIncome: 0,
    monthlySpending: 0,
    retirementSpending: 0,
    spendingCategories: [],
    preRetirementReturn: 0,
    coastingReturn: 0,
    retirementReturn: 0,
    inflationRate: 0,
    socialSecurityAge: 0,
    socialSecurityIncome: 0,
    safeWithdrawalRate: 0,
    medicareAge: 0,
    healthCareMonthly: 0,
    coastingMode: { enabled: false, coastingAge: 0, coasingMultiplier: 1 },
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

  // Persist pensions to localStorage
  const defaultPensions: Pension[] = [];
  const initialPensions: Pension[] = (() => {
    const s = localStorage.getItem('fire_pensions');
    if (s) { try { return JSON.parse(s) as Pension[]; } catch {} }
    return defaultPensions;
  })();
  const { pensions, addPension, updatePension, removePension, setAll: setAllPensions } = usePensions(initialPensions);

  // Persist pensions to localStorage
  useEffect(() => {
    if (pensions.length > 0) {
      localStorage.setItem('fire_pensions', JSON.stringify(pensions));
    } else {
      localStorage.removeItem('fire_pensions');
    }
  }, [pensions]);

  // === USE LIFE EVENTS HOOK ===
  const defaultLifeEvents: LifeEvent[] = [];
  const initialLifeEvents: LifeEvent[] = (() => {
    const s = localStorage.getItem('fire_life_events');
    if (s) { try { return JSON.parse(s) as LifeEvent[]; } catch {} }
    return defaultLifeEvents;
  })();
  const { lifeEvents, addLifeEvent, updateLifeEvent, removeLifeEvent, setAll: setAllLifeEvents } = useLifeEvents(initialLifeEvents);

  // Persist life events to localStorage
  useEffect(() => {
    if (lifeEvents.length > 0) {
      localStorage.setItem('fire_life_events', JSON.stringify(lifeEvents));
    } else {
      localStorage.removeItem('fire_life_events');
    }
  }, [lifeEvents]);

  // === USE DEBT PAYMENTS HOOK ===
  const defaultDebtPayments: DebtPayment[] = [];
  const initialDebtPayments: DebtPayment[] = (() => {
    const s = localStorage.getItem('fire_debt_payments');
    if (s) { try { return JSON.parse(s) as DebtPayment[]; } catch {} }
    return defaultDebtPayments;
  })();
  const { debtPayments, addDebtPayment, updateDebtPayment, removeDebtPayment, setAll: setAllDebtPayments } = useDebtPayments(initialDebtPayments);

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
  const { projectedMilestones, addProjectedMilestone, updateProjectedMilestone, removeProjectedMilestone, setAll: setAllMilestones } = useMilestones(initialMilestones);

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
  const { actuals, addActual, updateActual, removeActual, setAll: setAllActuals } = useActuals(initialActuals);

  // Persist actuals to localStorage
  useEffect(() => {
    if (actuals.length > 0) {
      localStorage.setItem('fire_actuals', JSON.stringify(actuals));
    } else {
      localStorage.removeItem('fire_actuals');
    }
  }, [actuals]);



  // === COASTING MODE STATE ===
  const [coastingMode, setCoastingMode] = useState({ enabled: false, coastingAge: 0, coasingMultiplier: 1 });

  // Persist coasting mode to localStorage
  useEffect(() => {
    localStorage.setItem('fire_coasting_mode', JSON.stringify(coastingMode));
  }, [coastingMode]);

  // === STRATEGY PRESET STATE ===
  const [currentStrategy, setCurrentStrategy] = useState(() => {
    const saved = localStorage.getItem('fire_strategy_preset');
    return saved || '';
  });

  // Persist strategy preset to localStorage
  useEffect(() => {
    localStorage.setItem('fire_strategy_preset', currentStrategy);
  }, [currentStrategy]);

  // === WITHDRAWAL STRATEGY STATE ===
  const [selectedWithdrawalStrategy, setSelectedWithdrawalStrategy] = useState(() => {
    const saved = localStorage.getItem('fire_withdrawal_strategy');
    return saved || '';
  });

  // Revision counter: incremented when strategy parameter overrides change,
  // so that projection recalculates with the new effective strategy.
  const [strategyOverridesRev, setStrategyOverridesRev] = useState(0);

  // Persist withdrawal strategy to localStorage
  useEffect(() => {
    localStorage.setItem('fire_withdrawal_strategy', selectedWithdrawalStrategy);
  }, [selectedWithdrawalStrategy]);

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

  // === APPLY REMOTE PLAN FROM CLOUD SYNC ===
  // When useCloudSync loads a plan from the backend, update all state to match.
  useEffect(() => {
    if (!cloudSync.remotePlan) return;
    const plan = cloudSync.remotePlan;

    // Update inputs
    if (plan.inputs) {
      setInputs(plan.inputs as unknown as InputState);
    }

    // Update arrays
    if (Array.isArray(plan.pensions)) setAllPensions(plan.pensions as unknown as Pension[]);
    if (Array.isArray(plan.lifeEvents)) setAllLifeEvents(plan.lifeEvents as unknown as LifeEvent[]);
    if (Array.isArray(plan.debtPayments)) setAllDebtPayments(plan.debtPayments as unknown as DebtPayment[]);
    if (Array.isArray(plan.projectedMilestones)) setAllMilestones(plan.projectedMilestones as unknown as ProjectedMilestone[]);
    if (Array.isArray(plan.actuals)) setAllActuals(plan.actuals as unknown as AnnualActuals[]);
    if (Array.isArray(plan.variableInflationRates)) setVariableInflationRates(plan.variableInflationRates as unknown as Array<{ id: string; age: number; rate: number }>);

    // Update coasting mode
    if (plan.coastingMode && typeof plan.coastingMode === 'object') {
      setCoastingMode(plan.coastingMode as unknown as { enabled: boolean; coastingAge: number; coasingMultiplier: number });
    }

    // Update strategy presets
    if (plan.strategyPreset !== undefined) setCurrentStrategy(plan.strategyPreset);
    if (plan.withdrawalStrategy !== undefined) setSelectedWithdrawalStrategy(plan.withdrawalStrategy);

    // Clear remotePlan after applying so it doesn't re-apply on re-render
    cloudSync.clearRemotePlan();
  }, [cloudSync.remotePlan, cloudSync.clearRemotePlan, setAllPensions, setAllLifeEvents, setAllDebtPayments, setAllMilestones, setAllActuals]);

  // === CLOUD SYNC TRIGGER ===
  // Removed automatic sync. User must click Save button to sync to cloud.

  // === RESET FUNCTION ===
  const resetAllData = () => {
    ['fire_actuals', 'fire_initial_actuals', 'fire_pensions', 'fire_life_events',
      'fire_debt_payments', 'fire_projected_milestones', 'fire_variable_inflation_rates',
      'fire_coasting_mode', 'fire_input_state', 'fire_has_seen_onboarding'].forEach(key => localStorage.removeItem(key));
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

  // Look up the effective strategy (base + any custom overrides from localStorage)
  // strategyOverridesRev is a dependency to trigger recalc when overrides change
  const withdrawalStrategy = getEffectiveStrategy(selectedWithdrawalStrategy);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _strategyRev = strategyOverridesRev; // ensures effect re-runs on override changes

  // Projection effect runs on all input changes (intentional - reactive forms)
  useEffect(() => {
    // Guard: skip calculation when critical inputs are zero/empty
    if (!inputs.currentAge || !inputs.retirementAge || !inputs.currentPortfolio) {
      setFireTarget(0);
      setFireAgeAchieved(null);
      return;
    }

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
      variableInflationRates ? variableInflationRates.map(v => ({ age: v.age, rate: v.rate })) : [],
      withdrawalStrategy
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
    actuals, inputs.spendingCategories ?? [], variableInflationRates ?? undefined,
    withdrawalStrategy, strategyOverridesRev,
  ]);

  // === ANNUAL SURPLUS CALCULATION ===
  const calculateAnnualSurplus = useCallback(() => {
    // Check if we're in the coasting period (working with reduced income)
    const isInCoastingPeriod = coastingMode.enabled && inputs.currentAge >= coastingMode.coastingAge && inputs.currentAge < inputs.retirementAge;

    // Calculate annual income and spending
    const annualIncome = (isInCoastingPeriod ? inputs.monthlyIncome * coastingMode.coasingMultiplier : inputs.monthlyIncome) * 12;
    const annualSpending = inputs.monthlySpending * 12;
    let annualSurplus = annualIncome - annualSpending;

    // Subtract annual debt payments where currently active
    debtPayments.forEach((debt) => {
      if (inputs.currentAge >= debt.startAge && inputs.currentAge <= debt.endAge) {
        annualSurplus -= debt.monthlyPayment * 12;
      }
    });

    // Subtract health care costs only during retirement gap (retired but not yet on Medicare)
    // This applies from retirement age to Medicare age
    const isRetired = inputs.currentAge >= inputs.retirementAge;
    const isBeforeMedicare = inputs.currentAge < inputs.medicareAge;
    if (isRetired && isBeforeMedicare) {
      annualSurplus -= inputs.healthCareMonthly * 12;
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
    coastingMode, actuals, inputs.spendingCategories ?? [], variableInflationRates,
    withdrawalStrategy
  );

  // Get projected value at a given age (handles display mode)
  const getProjectedValueAtAge = useCallback((age: number): number | undefined => {
    return displayMode === 'nominal'
      ? projection.find(p => p.age === age)?.portfolioAfterInflation
      : projection.find(p => p.age === age)?.portfolio;
  }, [displayMode, projection]);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {cloudSync.banner && (
          <Box
            sx={{
              bgcolor: 'info.main',
              color: 'info.contrastText',
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2">{cloudSync.banner}</Typography>
            <Button color="inherit" size="small" onClick={cloudSync.dismissBanner}>
              Dismiss
            </Button>
          </Box>
        )}
        <Header />

        <Container maxWidth="80%" sx={{ pb: 6, pt: 3, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Scoreboard - Always visible */}
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

          {/* Portfolio Chart - Always visible with edit button */}
          <Box sx={{ mb: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Portfolio Projection
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <DisplayModeToggle displayMode={displayMode} onChange={setDisplayMode} />
                <MuiTooltip title="Edit Inputs">
                  <Fab
                    color="primary"
                    size="small"
                    onClick={() => setDrawerOpen(true)}
                    sx={{ ml: 1 }}
                  >
                    <EditIcon />
                  </Fab>
                </MuiTooltip>
                <MuiTooltip title="Save to Cloud">
                  <Fab
                    color="secondary"
                    size="small"
                    onClick={() => cloudSync.pushNow()}
                    sx={{ ml: 1 }}
                  >
                    <SaveIcon />
                  </Fab>
                </MuiTooltip>
              </Box>
            </Box>

            <PortfolioChart
              projection={projection}
              fireTarget={fireTarget}
              displayMode={displayMode}
              actual={actuals}
            />
          </Box>

          {/* Analysis Tabs - Deep dive sections */}
          <AnalysisTabs
            projection={projection}
            fireTarget={fireTarget}
            lifeEvents={lifeEvents}
            projectedMilestones={projectedMilestones}
            onUpdateMilestone={(id, updates) => updateProjectedMilestone(id, updates)}
            onRemoveMilestone={(id) => removeProjectedMilestone(id)}
            getProjectedValueAtAge={getProjectedValueAtAge}
            actuals={actuals}
            onAddActual={(age) => addActual({ age, portfolio: 0, savings: 0, spending: 0 })}
            onUpdateActual={(age, updates) => updateActual(age, updates)}
            onRemoveActual={(age) => removeActual(age)}
            inputs={{
              currentAge: inputs.currentAge,
              retirementAge: inputs.retirementAge,
              lifeExpectancy: inputs.lifeExpectancy,
              currentPortfolio: inputs.currentPortfolio,
              retirementSpending: inputs.retirementSpending,
              retirementReturn: inputs.retirementReturn,
              inflationRate: inputs.inflationRate,
              socialSecurityAge: inputs.socialSecurityAge,
              socialSecurityIncome: inputs.socialSecurityIncome,
              medicareAge: inputs.medicareAge,
              pensionIncome: aggregatePensions(pensions).totalAnnualPensionIncome,
            }}
            annualSurplus={annualSurplus}
            displayMode={displayMode}
            selectedWithdrawalStrategy={selectedWithdrawalStrategy}
            onWithdrawalStrategySelect={setSelectedWithdrawalStrategy}
            onStrategyConfigChange={() => setStrategyOverridesRev(r => r + 1)}
          />
        </Container>

        <Footer />

        {/* Onboarding Walkthrough */}
        <OnboardingWalkthrough
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />

        {/* Inputs Drawer */}
        <InputsDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          inputs={inputs}
          onInputsChange={(updates) => setInputs(prev => ({ ...prev, ...updates }))}
          coastingMode={coastingMode}
          onCoastingModeChange={setCoastingMode}
          currentStrategy={currentStrategy}
          onStrategyChange={setCurrentStrategy}
          pensions={pensions}
          onAddPension={() => addPension({ name: 'New Pension', currentAnnualPayout: 0, startAge: 65 })}
          onUpdatePension={(id, updates) => updatePension(id, updates)}
          onDeletePension={(id) => removePension(id)}
          lifeEvents={lifeEvents}
          onAddLifeEvent={() => addLifeEvent({ name: 'New Event', type: 'one-time', amount: 0, startAge: inputs.currentAge, endAge: undefined, description: '' })}
          onUpdateLifeEvent={(id, updates) => updateLifeEvent(id, updates)}
          onDeleteLifeEvent={(id) => removeLifeEvent(id)}
          debtPayments={debtPayments}
          onAddDebtPayment={() => addDebtPayment({ name: 'New Debt', monthlyPayment: 0, startAge: inputs.currentAge, endAge: inputs.currentAge + 5, description: '' })}
          onUpdateDebtPayment={(id, updates) => updateDebtPayment(id, updates)}
          onDeleteDebtPayment={(id) => removeDebtPayment(id)}
          projectedMilestones={projectedMilestones}
          onAddMilestone={() => addProjectedMilestone({ age: inputs.currentAge + 5, event: 'New Milestone', category: 'event' })}
          onUpdateMilestone={(id, updates) => updateProjectedMilestone(id, updates)}
          onDeleteMilestone={(id) => removeProjectedMilestone(id)}
          variableInflationRates={variableInflationRates}
          onVariableInflationRatesChange={setVariableInflationRates}
        />
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
  actuals: AnnualActuals[], spendingCategories: any[], variableInflationRates: Array<{ age: number; rate: number }>,
  withdrawalStrategy?: import('./types/withdrawal-strategies').WithdrawalStrategy
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
    coastingMode, actuals, spendingCategories, variableInflationRates,
    withdrawalStrategy
  );
  return newProjection;
}
