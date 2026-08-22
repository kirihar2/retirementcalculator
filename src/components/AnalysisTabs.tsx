import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import {
  TableChart as TableChartIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

import type { ProjectionYear, LifeEvent, AnnualActuals, Pension, ProjectedMilestone } from '../types';
import { ProjectionTable } from './ProjectionTable';
import { Milestones } from './Milestones';
import { MonteCarloPanel } from './MonteCarloPanel';
import { WithdrawalComparisonTable } from './WithdrawalComparisonTable';
import { WithdrawalStrategyConfig } from './WithdrawalStrategyConfig';
import { ActualsSection } from './ActualsSection';
import { TrendAnalysisPanel } from './TrendAnalysisPanel';

/**
 * AnalysisTabs - Tabbed navigation for deep analysis sections
 *
 * Three tabs:
 * - Projections: ProjectionTable + Milestones
 * - Risk Analysis: MonteCarloPanel + WithdrawalComparisonTable
 * - Track Progress: ActualsSection + TrendAnalysisPanel
 */
export interface AnalysisTabsProps {
  // Projection data
  projection: ProjectionYear[];
  fireTarget: number;

  // Life events & milestones
  lifeEvents: LifeEvent[];
  projectedMilestones: ProjectedMilestone[];
  onUpdateMilestone: (id: string, updates: Partial<ProjectedMilestone>) => boolean;
  onRemoveMilestone: (id: string) => void;
  getProjectedValueAtAge: (age: number) => number | undefined;

  // Actuals
  actuals: AnnualActuals[];
  onAddActual: (age: number) => void;
  onUpdateActual: (age: number, updates: Partial<AnnualActuals>) => void;
  onRemoveActual: (age: number) => void;

  // Inputs (for Monte Carlo and other calculations)
  inputs: {
    currentAge: number;
    retirementAge: number;
    lifeExpectancy: number;
    currentPortfolio: number;
    retirementSpending: number;
    retirementReturn: number;
    inflationRate: number;
    socialSecurityAge: number;
    socialSecurityIncome: number;
    medicareAge: number;
    pensionIncome: number;
  };
  annualSurplus: number;
  displayMode: 'real' | 'nominal';

  // Withdrawal strategy
  selectedWithdrawalStrategy: string;
  onWithdrawalStrategySelect: (strategyId: string) => void;
  onStrategyConfigChange?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      sx={{ py: 3 }}
    >
      {value === index && children}
    </Box>
  );
}

export function AnalysisTabs(props: AnalysisTabsProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="analysis tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<TableChartIcon />}
            iconPosition="start"
            label="Projections"
            id="analysis-tab-0"
            aria-controls="analysis-tabpanel-0"
          />
          <Tab
            icon={<AnalyticsIcon />}
            iconPosition="start"
            label="Risk Analysis"
            id="analysis-tab-1"
            aria-controls="analysis-tabpanel-1"
          />
          <Tab
            icon={<TrendingUpIcon />}
            iconPosition="start"
            label="Track Progress"
            id="analysis-tab-2"
            aria-controls="analysis-tabpanel-2"
          />
        </Tabs>
      </Box>

      {/* Projections Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ProjectionTable
            projection={props.projection}
            lifeEvents={props.lifeEvents}
            actual={props.actuals}
          />
          <Milestones
            retirementAge={props.inputs.retirementAge}
            socialSecurityAge={props.inputs.socialSecurityAge}
            socialSecurityIncome={props.inputs.socialSecurityIncome}
            medicareAge={props.inputs.medicareAge}
            projectedMilestones={props.projectedMilestones}
            onUpdateMilestone={props.onUpdateMilestone}
            onRemoveMilestone={props.onRemoveMilestone}
            getProjectedValueAtAge={props.getProjectedValueAtAge}
          />
        </Box>
      </TabPanel>

      {/* Risk Analysis Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <MonteCarloPanel
            initialPortfolio={props.inputs.currentPortfolio}
            retirementAge={props.inputs.retirementAge}
            lifeExpectancy={props.inputs.lifeExpectancy}
            monthlyWithdrawal={Math.max(0, props.inputs.retirementSpending - (props.inputs.socialSecurityIncome + props.inputs.pensionIncome) / 12)}
            expectedReturn={props.inputs.retirementReturn}
            currentAge={props.inputs.currentAge}
            annualSavings={props.annualSurplus}
            displayMode={props.displayMode}
          />
          <WithdrawalStrategyConfig
            selectedStrategyId={props.selectedWithdrawalStrategy}
            onChange={props.onStrategyConfigChange}
          />
          <WithdrawalComparisonTable
            initialPortfolio={props.inputs.currentPortfolio}
            retirementAge={props.inputs.retirementAge}
            lifeExpectancy={props.inputs.lifeExpectancy}
            expectedReturn={props.inputs.retirementReturn}
            inflationRate={props.inputs.inflationRate}
            selectedStrategyId={props.selectedWithdrawalStrategy}
            onStrategySelect={props.onWithdrawalStrategySelect}
          />
        </Box>
      </TabPanel>

      {/* Track Progress Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ActualsSection
            actuals={props.actuals}
            onAddActual={props.onAddActual}
            onUpdateActual={props.onUpdateActual}
            onRemoveActual={props.onRemoveActual}
          />
          <TrendAnalysisPanel
            actuals={props.actuals}
            projection={props.projection}
            retirementAge={props.inputs.retirementAge}
            currentAge={props.inputs.currentAge}
          />
        </Box>
      </TabPanel>
    </Box>
  );
}
