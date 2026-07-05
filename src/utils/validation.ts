import type { LifeEvent, Pension, ProjectedMilestone, ProjectionYear } from '../types';

/**
 * Validates life events for structural integrity and required fields.
 *
 * @param events - Array of LifeEvent objects to validate
 * @returns Array of error strings, one per invalid event. Empty if all valid.
 *
 * @example
 * ```ts
 * const errors = validateLifeEvents([
 *   { name: 'Childcare', amount: 2000 }, // Valid
 *   { name: '', amount: 1000 }, // Invalid - missing name
 * ]);
 * // returns ["Event name is required"]
 * ```
 */
export function validateLifeEvents(events: LifeEvent[]): string[] {
  const errors: string[] = [];

  for (const event of events) {
    if (!event.name || event.name.trim() === '') {
      errors.push(`[${event.description}] Event name is required`);
    }
    if (event.amount <= 0) {
      errors.push(`[${event.description}] Amount must be > 0 (current: ${event.amount})`);
    }
    if (event.startAge < 18 || (event.endAge !== undefined && event.endAge < 18)) {
      errors.push(`[${event.description}] Age must be >= 18`);
    }
    if (event.endAge !== undefined && event.endAge < event.startAge) {
      errors.push(`[${event.description}] End age (${event.endAge}) must be >= start age (${event.startAge})`);
    }
    // Optional: validate description length
    if (event.description && event.description.length > 200) {
      errors.push(`[${event.description}] Description is too long (max 200 chars)`);
    }
  }

  return errors;
}

/**
 * Validates pensions for structural integrity and required fields.
 *
 * @param pensions - Array of Pension objects to validate
 * @returns Array of error strings, one per invalid pension. Empty if all valid.
 */
export function validatePensions(pensions: Pension[]): string[] {
  const errors: string[] = [];

  for (const pension of pensions) {
    if (!pension.name || pension.name.trim() === '') {
      errors.push(`[${pension.name}] Pension name is required`);
    }
    if (pension.currentAnnualPayout < 0) {
      errors.push(`[${pension.name}] Annual payout must be >= 0 (current: ${pension.currentAnnualPayout})`);
    }
    if (pension.startAge !== null && (pension.startAge < 50 || pension.startAge > 75)) {
      errors.push(`[${pension.name}] Start age must be between 50-75 (current: ${pension.startAge})`);
    }
    if (pension.endAge != null && pension.endAge < pension.startAge) {
      errors.push(`[${pension.name}] End age (${pension.endAge}) must be >= start age (${pension.startAge})`);
    }
  }

  return errors;
}

/**
 * Validates a single projected milestone for structural integrity.
 *
 * @param milestone - The ProjectedMilestone to validate
 * @returns Error string if invalid, null if valid
 */
export function validateMilestone(milestone: Pick<ProjectedMilestone, 'age' | 'event' | 'category'>): string | null {
  // Validate age is reasonable (can't be in the past relative to current age - handled by caller)
  if (!milestone.age || milestone.age < 18 || milestone.age > 120) {
    return `Milestone age must be between 18-120`;
  }

  // Validate event name is not empty
  if (!milestone.event || milestone.event.trim() === '') {
    return 'Milestone event name is required';
  }

  // Validate category is one of allowed values
  if (!['growth', 'income', 'event', 'health'].includes(milestone.category)) {
    return `Invalid milestone category. Must be one of: growth, income, event, health`;
  }

  return null;
}

/**
 * Validates projection years for structural integrity.
 *
 * @param years - Array of ProjectionYear objects to validate
 * @returns Array of error strings. Empty if all valid.
 */
export function validateProjectionYears(years: ProjectionYear[]): string[] {
  const errors: string[] = [];

  for (const year of years) {
    // Portfolio must be non-negative
    if (!isFinite(year.portfolio) || year.portfolio < 0) {
      errors.push(`[age ${year.age}] Portfolio must be a finite number >= 0 (current: ${year.portfolio})`);
    }

    // Return rate must be reasonable (can't be below -100% or above +200%)
    if (year.annualReturn < -100 || year.annualReturn > 200) {
      errors.push(`[age ${year.age}] Return rate must be between -100% and 200% (current: ${year.annualReturn}%)`);
    }

    // Inflation rate must be reasonable
    if (year.inflationRate < -10 || year.inflationRate > 50) {
      errors.push(`[age ${year.age}] Inflation rate must be between -10% and 50% (current: ${year.inflationRate}%)`);
    }

    // Spending must be non-negative if provided
    if (typeof year.annualSpending === 'number' && year.annualSpending < 0) {
      errors.push(`[age ${year.age}] Annual spending must be >= 0 (current: ${year.annualSpending})`);
    }
  }

  return errors;
}

/**
 * Validates milestones for duplicate ages and structural integrity.
 *
 * @param milestones - Array of ProjectedMilestone objects to validate
 * @returns Array of error strings. Empty if all valid.
 */
export function validateMilestones(milestones: Pick<ProjectedMilestone, 'age' | 'event' | 'category'>[]): string[] {
  const errors: string[] = [];

  // Check for duplicate ages
  const ageMap = new Map<number, ProjectedMilestone>();

  for (const milestone of milestones) {
    if (ageMap.has(milestone.age)) {
      const existing = ageMap.get(milestone.age)!;
      errors.push(`Duplicate milestone at age ${milestone.age}: "${existing.event}" vs "${milestone.event}"`);
    } else {
      ageMap.set(milestone.age, milestone as ProjectedMilestone);
    }
  }

  return errors;
}
