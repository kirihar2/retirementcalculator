import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

interface OnboardingWalkthroughProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  {
    label: 'Welcome',
    title: 'Welcome to the FIRE Dashboard',
    content:
      'This app helps you plan your path to Financial Independence, Retire Early (FIRE). ' +
      'We\'ll walk you through the key features so you can get started quickly.',
  },
  {
    label: 'Inputs',
    title: 'Enter Your Details',
    content:
      'Click the "Edit Inputs" button on the right to open the inputs drawer. ' +
      'Here you\'ll enter your age, income, portfolio, spending, and other financial details. ' +
      'The inputs are organized into accordion sections for easy navigation.',
  },
  {
    label: 'Account Breakdown',
    title: 'Track Account Types',
    content:
      'Break down your portfolio by account type (Traditional, Roth, Taxable, HSA) for accurate tax projections. ' +
      'Each account type has different tax treatment: Traditional is taxed on withdrawal, Roth is tax-free, ' +
      'Taxable gets capital gains rates, and HSA is tax-free for medical expenses.',
  },
  {
    label: 'Tax Settings',
    title: 'Configure Your Taxes',
    content:
      'Set your filing status (Single or Married Filing Jointly) and state tax rate. ' +
      'The app uses 2026 tax brackets to calculate federal, state, and capital gains taxes on your retirement withdrawals. ' +
      'You\'ll also see Required Minimum Distributions (RMDs) starting at age 73.',
  },
  {
    label: 'Scoreboard',
    title: 'Track Your Progress',
    content:
      'The scoreboard at the top shows your key metrics: FIRE target, current portfolio, ' +
      'annual savings, and the age you\'ll reach FIRE. These update automatically as you change inputs.',
  },
  {
    label: 'Charts & Analysis',
    title: 'Visualize Your Plan',
    content:
      'Below the scoreboard, you\'ll find detailed charts and analysis tabs including Tax Projections, ' +
      'RMD Schedule, and Tax Optimization. See year-by-year tax breakdowns, required distributions, ' +
      'and strategies like Roth conversions to minimize your tax burden.',
  },
  {
    label: 'Get Started',
    title: 'You\'re All Set!',
    content:
      'Start by entering your current age, retirement age, and portfolio value. ' +
      'Then add your account breakdown and tax settings. ' +
      'The dashboard will automatically calculate your FIRE target and show you the tax-aware path forward.',
  },
];

export const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    localStorage.setItem('fire_has_seen_onboarding', 'true');
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  const isLastStep = activeStep === steps.length - 1;
  const currentStep = steps[activeStep];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{currentStep.title}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {currentStep.content}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={handleSkip} color="inherit">
          Skip
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} variant="outlined">
              Back
            </Button>
          )}
          <Button onClick={handleNext} variant="contained">
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
