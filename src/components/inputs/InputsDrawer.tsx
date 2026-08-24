import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Park as ParkIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  TrendingUp as TrendingUpIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Flag as FlagIcon,
  Percent as PercentIcon,
} from '@mui/icons-material';

import type { InputState, LifeEvent, DebtPayment, Pension, ProjectedMilestone } from '../../types';
import { PersonalDetailsControlled } from './internal/PersonalDetailsControlled';
import { FinancialDetailsControlled } from './internal/FinancialDetailsControlled';
import { RetirementPlanControlled } from './internal/RetirementPlanControlled';
import { HealthCareControlled } from './internal/HealthCareControlled';
import { ReturnsAndInflationControlled } from './internal/ReturnsAndInflationControlled';
import { PensionsControlled } from './internal/PensionsControlled';
import { LifeEventsControlled } from './internal/LifeEventsControlled';
import { DebtPaymentsControlled } from './internal/DebtPaymentsControlled';
import { MilestonesControlled } from './internal/MilestonesControlled';
import { VariableInflationControlled } from './internal/VariableInflationControlled';
import { StrategySelector } from './StrategySelector';

/**
 * InputsDrawer - Right-side drawer containing all input sections
 *
 * Organized into collapsible accordion groups:
 * - Personal & Financial
 * - Health & Returns
 * - Advanced (Pensions, Life Events, Debt, Milestones, Variable Inflation)
 */
export interface InputsDrawerProps {
  open: boolean;
  onClose: () => void;

  // Input state
  inputs: InputState;
  onInputsChange: (updates: Partial<InputState>) => void;

  // Coasting mode
  coastingMode: { enabled: boolean; coastingAge: number; coasingMultiplier: number };
  onCoastingModeChange: (mode: { enabled: boolean; coastingAge: number; coasingMultiplier: number }) => void;

  // Strategy preset
  currentStrategy: string;
  onStrategyChange: (strategy: string) => void;

  // Array data with CRUD hooks
  pensions: Pension[];
  onAddPension: () => void;
  onUpdatePension: (id: string, updates: Partial<Pension>) => boolean;
  onDeletePension: (id: string) => void;

  lifeEvents: LifeEvent[];
  onAddLifeEvent: () => void;
  onUpdateLifeEvent: (id: string, updates: Partial<LifeEvent>) => boolean;
  onDeleteLifeEvent: (id: string) => void;

  debtPayments: DebtPayment[];
  onAddDebtPayment: () => void;
  onUpdateDebtPayment: (id: string, updates: Partial<DebtPayment>) => boolean;
  onDeleteDebtPayment: (id: string) => void;

  projectedMilestones: ProjectedMilestone[];
  onAddMilestone: () => void;
  onUpdateMilestone: (id: string, updates: Partial<ProjectedMilestone>) => boolean;
  onDeleteMilestone: (id: string) => void;

  variableInflationRates: Array<{ id: string; age: number; rate: number }>;
  onVariableInflationRatesChange: (rates: Array<{ id: string; age: number; rate: number }>) => void;
}

export function InputsDrawer({
  open,
  onClose,
  inputs,
  onInputsChange,
  coastingMode,
  onCoastingModeChange,
  currentStrategy,
  onStrategyChange,
  pensions,
  onAddPension,
  onUpdatePension,
  onDeletePension,
  lifeEvents,
  onAddLifeEvent,
  onUpdateLifeEvent,
  onDeleteLifeEvent,
  debtPayments,
  onAddDebtPayment,
  onUpdateDebtPayment,
  onDeleteDebtPayment,
  projectedMilestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  variableInflationRates,
  onVariableInflationRatesChange,
}: InputsDrawerProps) {
  // Helper to update individual input fields
  const updateInput = (field: keyof InputState) => (value: any) => {
    onInputsChange({ [field]: value });
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 420 },
          maxWidth: '100vw',
          px: 3,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Edit Inputs
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{ overflow: 'auto', flex: 1, py: 2 }}>
        {/* Personal & Financial */}
        <Accordion defaultExpanded sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" color="primary" />
              <Typography fontWeight={600}>Personal & Financial</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <PersonalDetailsControlled
              currentAge={inputs.currentAge}
              retirementAge={inputs.retirementAge}
              lifeExpectancy={inputs.lifeExpectancy}
              onCurrentAgeChange={updateInput('currentAge')}
              onRetirementAgeChange={updateInput('retirementAge')}
              onLifeExpectancyChange={updateInput('lifeExpectancy')}
            />

            <FinancialDetailsControlled
              currentPortfolio={inputs.currentPortfolio}
              monthlyIncome={inputs.monthlyIncome}
              monthlySpending={inputs.monthlySpending}
              onCurrentPortfolioChange={updateInput('currentPortfolio')}
              onMonthlyIncomeChange={updateInput('monthlyIncome')}
              onMonthlySpendingChange={updateInput('monthlySpending')}
            />

            <StrategySelector
              currentStrategy={currentStrategy}
              onStrategyChange={onStrategyChange}
              onAllocationChange={(stockPercent, bondPercent, expectedReturn) => {
                onInputsChange({
                  preRetirementReturn: Math.round(expectedReturn * 10) / 10,
                  retirementReturn: Math.round(expectedReturn * 10) / 10,
                });
              }}
            />
          </AccordionDetails>
        </Accordion>

        {/* Retirement Plan */}
        <Accordion sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ParkIcon fontSize="small" color="success" />
              <Typography fontWeight={600}>Retirement Plan</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <RetirementPlanControlled
              retirementSpending={inputs.retirementSpending}
              socialSecurityAge={inputs.socialSecurityAge}
              socialSecurityIncome={inputs.socialSecurityIncome}
              safeWithdrawalRate={inputs.safeWithdrawalRate}
              onRetirementSpendingChange={updateInput('retirementSpending')}
              onSSAgeChange={updateInput('socialSecurityAge')}
              onSSIncomeChange={updateInput('socialSecurityIncome')}
              onSWRChange={updateInput('safeWithdrawalRate')}
            />
          </AccordionDetails>
        </Accordion>

        {/* Health Care */}
        <Accordion sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HealthAndSafetyIcon fontSize="small" color="info" />
              <Typography fontWeight={600}>Health Care</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <HealthCareControlled
              medicareAge={inputs.medicareAge}
              healthCareMonthly={inputs.healthCareMonthly}
              setMedicareAge={updateInput('medicareAge')}
              setHealthCareMonthly={updateInput('healthCareMonthly')}
            />
          </AccordionDetails>
        </Accordion>

        {/* Returns & Inflation */}
        <Accordion sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon fontSize="small" color="warning" />
              <Typography fontWeight={600}>Returns & Inflation</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <ReturnsAndInflationControlled
              preRetirementReturn={inputs.preRetirementReturn}
              coastingReturn={inputs.coastingReturn}
              retirementReturn={inputs.retirementReturn}
              inflationRate={inputs.inflationRate}
              onPreRetirementReturnChange={(value) => {
                updateInput('preRetirementReturn')(value);
                onStrategyChange(''); // Clear strategy when manually edited
              }}
              onCoastingReturnChange={updateInput('coastingReturn')}
              onRetirementReturnChange={(value) => {
                updateInput('retirementReturn')(value);
                onStrategyChange(''); // Clear strategy when manually edited
              }}
              onInflationRateChange={updateInput('inflationRate')}
            />
          </AccordionDetails>
        </Accordion>

        {/* Coasting Mode */}
        <Accordion sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ParkIcon fontSize="small" color="success" />
              <Typography fontWeight={600}>Coasting Mode</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                Coasting Mode
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <input
                  type="checkbox"
                  checked={coastingMode.enabled}
                  onChange={(e) => onCoastingModeChange({ ...coastingMode, enabled: e.target.checked })}
                  id="coasting-enabled-drawer"
                />
                <label htmlFor="coasting-enabled-drawer">Enable Coasting Mode</label>
              </Box>
              {coastingMode.enabled && (
                <Box sx={{ display: 'flex', gap: 2, pl: 1 }}>
                  <Box>
                    <Typography variant="caption">Coasting Age</Typography>
                    <input
                      type="number"
                      value={coastingMode.coastingAge}
                      onChange={(e) => onCoastingModeChange({ ...coastingMode, coastingAge: Number(e.target.value) })}
                      min={18}
                      max={inputs.retirementAge - 5}
                      style={{ width: 80, padding: 4 }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption">Income Multiplier</Typography>
                    <input
                      type="number"
                      value={coastingMode.coasingMultiplier}
                      onChange={(e) => onCoastingModeChange({ ...coastingMode, coasingMultiplier: Number(e.target.value) })}
                      min={0.5}
                      max={1}
                      step={0.05}
                      style={{ width: 80, padding: 4 }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Advanced */}
        <Accordion sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkIcon fontSize="small" color="warning" />
              <Typography fontWeight={600}>Advanced</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <PensionsControlled
              pensions={pensions}
              onAdd={onAddPension}
              onUpdate={onUpdatePension}
              onDelete={onDeletePension}
            />

            <LifeEventsControlled
              lifeEvents={lifeEvents}
              onAdd={onAddLifeEvent}
              onUpdate={onUpdateLifeEvent}
              onDelete={onDeleteLifeEvent}
            />

            <DebtPaymentsControlled
              debtPayments={debtPayments}
              onAdd={onAddDebtPayment}
              onUpdate={onUpdateDebtPayment}
              onDelete={onDeleteDebtPayment}
            />

            <MilestonesControlled
              projectedMilestones={projectedMilestones}
              onAdd={onAddMilestone}
              onUpdate={onUpdateMilestone}
              onDelete={onDeleteMilestone}
            />

            <VariableInflationControlled
              variableInflationRates={variableInflationRates}
              inflationRate={inputs.inflationRate}
              onAdd={() => {
                const newEntry = { id: Date.now().toString(), age: inputs.currentAge + 5, rate: inputs.inflationRate };
                onVariableInflationRatesChange([...variableInflationRates, newEntry]);
              }}
              onUpdate={(id, updates) => {
                onVariableInflationRatesChange(
                  variableInflationRates.map(r => r.id === id ? { ...r, ...updates } : r)
                );
              }}
              onDelete={(id) => {
                onVariableInflationRatesChange(variableInflationRates.filter(r => r.id !== id));
              }}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Drawer>
  );
}
