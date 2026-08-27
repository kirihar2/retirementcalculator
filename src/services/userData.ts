/**
 * User-data service client.
 *
 * Every plan read/write goes through the Cloud Functions backend. This
 * module owns the HTTP calls, attaches the Firebase ID token to every
 * request, and maps backend errors to a typed `UserDataError` union.
 *
 * Callers are the React components and the auth service (for
 * `deleteAccount`). They never touch `fetch` or Firestore directly.
 */
import { getAuthInstance, getApiBaseUrl, isFirebaseEnabled } from './firebase';
import type { ClaimResponse, Plan, PlanDocument } from '../types/plan';

// === Error types ===

export type UserDataErrorCode =
  | 'unauthenticated'
  | 'validation-error'
  | 'not-found'
  | 'server-error'
  | 'network-error'
  | 'disabled'
  | 'unknown';

export class UserDataError extends Error {
  readonly code: UserDataErrorCode;
  readonly status?: number;
  constructor(code: UserDataErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'UserDataError';
    this.code = code;
    this.status = status;
  }
}

// === Internal helpers ===

async function getActiveUid(): Promise<string> {
  const auth = getAuthInstance();
  if (!auth) throw new UserDataError('disabled', 'Authentication is not enabled for this app.');
  const user = auth.currentUser;
  if (!user) throw new UserDataError('unauthenticated', 'No active user session.');
  return user.uid;
}

async function getIdToken(): Promise<string> {
  const auth = getAuthInstance();
  if (!auth) throw new UserDataError('disabled', 'Authentication is not enabled for this app.');
  const user = auth.currentUser;
  if (!user) throw new UserDataError('unauthenticated', 'No active user session.');
  // getIdToken() auto-refreshes if the cached token is expired.
  return user.getIdToken();
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  if (!isFirebaseEnabled()) {
    throw new UserDataError('disabled', 'Authentication is not enabled for this app.');
  }
  const token = await getIdToken();
  const url = `${getApiBaseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers ?? {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    // Network errors (offline, DNS, CORS) throw rather than returning a Response.
    throw new UserDataError('network-error', 'Network request failed. Check your connection.');
  }
  if (response.ok) {
    return (await response.json()) as T;
  }
  // Structured error from backend: `{ error: { code, message } }`
  let backendCode: string | undefined;
  let backendMessage: string | undefined;
  try {
    const body = await response.json();
    backendCode = body?.error?.code;
    backendMessage = body?.error?.message;
  } catch {
    // Body wasn't JSON; fall through to status-based mapping.
  }
  switch (response.status) {
    case 401:
      throw new UserDataError('unauthenticated', backendMessage ?? 'Session expired. Please sign in again.', 401);
    case 400:
      throw new UserDataError('validation-error', backendMessage ?? 'Invalid request payload.', 400);
    case 404:
      throw new UserDataError('not-found', backendMessage ?? 'Resource not found.', 404);
    case 500:
    default:
      throw new UserDataError(
        'server-error',
        backendMessage ?? `Server error (HTTP ${response.status}).`,
        response.status
      );
  }
}

// === Public API ===

/** Load the authenticated user's plan. Resolves null when none exists. */
export async function loadPlan(): Promise<PlanDocument | null> {
  await getActiveUid(); // auth check; throws if unauthenticated
  try {
    return await apiRequest<PlanDocument>('/api/plan', { method: 'GET' });
  } catch (err) {
    if (err instanceof UserDataError && err.code === 'not-found') return null;
    throw err;
  }
}

/** Save the plan for the authenticated user. */
export async function savePlan(plan: Plan): Promise<{ status: string; updatedAt: string }> {
  await getActiveUid();
  return apiRequest<{ status: string; updatedAt: string }>('/api/plan', {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
}

/**
 * Claim an anonymous plan for the newly signed-in user. Returns
 * `{ claimed: true }` on success, or `{ claimed: false, existingPlan }`
 * when the user already had a plan remotely.
 */
export async function claimAnonymousPlan(plan: Plan): Promise<ClaimResponse> {
  await getActiveUid();
  return apiRequest<ClaimResponse>('/api/claim-anonymous-plan', {
    method: 'POST',
    body: JSON.stringify(plan),
  });
}

/**
 * Delete the authenticated user's account (server-side Firestore data +
 * Auth user). The caller is responsible for clearing localStorage and
 * signing out the local session after this resolves.
 */
export async function deleteAllUserData(): Promise<void> {
  await getActiveUid();
  await apiRequest<{ status: string }>('/api/account', { method: 'DELETE' });
}

// === Plan aggregation helpers ===

/**
 * Returns true when the plan has all numeric inputs at 0 and all arrays empty.
 * Used to prevent pushing empty plans to the backend on first login.
 */
export function isEmptyPlan(plan: Plan | null): boolean {
  if (!plan) return true;
  const inputs = plan.inputs as Record<string, unknown>;
  if (!inputs) return true;

  // Check numeric inputs
  const numericKeys = [
    'currentAge', 'retirementAge', 'lifeExpectancy', 'currentPortfolio',
    'monthlyIncome', 'monthlySpending', 'retirementSpending', 'preRetirementReturn',
    'coastingReturn', 'retirementReturn', 'inflationRate', 'socialSecurityAge',
    'socialSecurityIncome', 'safeWithdrawalRate', 'medicareAge', 'healthCareMonthly',
  ];
  for (const key of numericKeys) {
    const val = inputs[key];
    if (typeof val === 'number' && val !== 0) return false;
  }

  // Check array inputs
  const arrayKeys = ['pensions', 'lifeEvents', 'debtPayments', 'projectedMilestones', 'actuals', 'variableInflationRates'] as const;
  for (const key of arrayKeys) {
    const arr = plan[key];
    if (Array.isArray(arr) && arr.length > 0) return false;
  }

  // Check coasting mode
  if (plan.coastingMode && typeof plan.coastingMode === 'object') {
    const cm = plan.coastingMode as Record<string, unknown>;
    if (cm.enabled === true) return false;
    if (typeof cm.coastingAge === 'number' && cm.coastingAge !== 0) return false;
  }

  // Check strategy presets
  if (plan.strategyPreset && plan.strategyPreset !== '') return false;
  if (plan.withdrawalStrategy && plan.withdrawalStrategy !== '') return false;

  // Check accounts
  if (plan.accounts && typeof plan.accounts === 'object') {
    const accounts = plan.accounts as Record<string, unknown>;
    if (typeof accounts.traditionalBalance === 'number' && accounts.traditionalBalance !== 0) return false;
    if (typeof accounts.rothBalance === 'number' && accounts.rothBalance !== 0) return false;
    if (typeof accounts.taxableBalance === 'number' && accounts.taxableBalance !== 0) return false;
    if (typeof accounts.hsaBalance === 'number' && accounts.hsaBalance !== 0) return false;
  }

  // Check taxConfig
  if (plan.taxConfig && typeof plan.taxConfig === 'object') {
    const taxConfig = plan.taxConfig as Record<string, unknown>;
    if (taxConfig.filingStatus && taxConfig.filingStatus !== '') return false;
    if (typeof taxConfig.stateTaxRate === 'number' && taxConfig.stateTaxRate !== 0) return false;
  }

  return true;
}

/**
 * Collect the flat localStorage keys used by `FIRECalculator.tsx` into a
 * single `Plan` document. Returns `null` when there is no local data at
 * all (so the claim flow can no-op).
 */
export function aggregateLocalPlan(): Plan | null {
  const raw = {
    inputs: localStorage.getItem('fire_input_state'),
    pensions: localStorage.getItem('fire_pensions'),
    lifeEvents: localStorage.getItem('fire_life_events'),
    debtPayments: localStorage.getItem('fire_debt_payments'),
    projectedMilestones: localStorage.getItem('fire_projected_milestones'),
    actuals: localStorage.getItem('fire_actuals'),
    coastingMode: localStorage.getItem('fire_coasting_mode'),
    variableInflationRates: localStorage.getItem('fire_variable_inflation_rates'),
    strategyPreset: localStorage.getItem('fire_strategy_preset'),
    withdrawalStrategy: localStorage.getItem('fire_withdrawal_strategy'),
  };
  const hasAnyData = Object.values(raw).some((v) => v !== null);
  if (!hasAnyData) return null;

  const parse = <T,>(key: string, fallback: T): T => {
    const v = raw[key as keyof typeof raw];
    if (!v) return fallback;
    try {
      return JSON.parse(v) as T;
    } catch {
      return fallback;
    }
  };

  const inputs = parse<Record<string, unknown>>('inputs', {});

  // Extract accounts and taxConfig from inputs for top-level Plan fields
  const accounts = inputs.accounts as Record<string, unknown> | undefined;
  const taxConfig = inputs.taxConfig as Record<string, unknown> | undefined;

  return {
    inputs,
    pensions: parse('pensions', []),
    lifeEvents: parse('lifeEvents', []),
    debtPayments: parse('debtPayments', []),
    projectedMilestones: parse('projectedMilestones', []),
    actuals: parse('actuals', []),
    coastingMode: parse('coastingMode', {}),
    variableInflationRates: parse('variableInflationRates', []),
    strategyPreset: raw.strategyPreset ?? undefined,
    withdrawalStrategy: raw.withdrawalStrategy ?? undefined,
    accounts,
    taxConfig,
  };
}

/**
 * Write a backend-returned `Plan` back into the flat localStorage keys
 * that `FIRECalculator.tsx` reads on mount. Called on sign-in
 * reconciliation and on fresh-device bootstrap.
 */
export function applyRemotePlan(plan: Plan): void {
  // Merge top-level accounts and taxConfig back into inputs for localStorage
  const inputs = { ...(plan.inputs ?? {}) };
  if (plan.accounts) {
    inputs.accounts = plan.accounts;
  }
  if (plan.taxConfig) {
    inputs.taxConfig = plan.taxConfig;
  }

  localStorage.setItem('fire_input_state', JSON.stringify(inputs));
  const arr = (v: unknown) => (Array.isArray(v) ? v : []);
  const writeOrRemove = (key: string, value: unknown) => {
    if (Array.isArray(value) && value.length > 0) {
      localStorage.setItem(key, JSON.stringify(value));
    } else if (value && typeof value === 'object' && Object.keys(value as object).length > 0) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  };
  writeOrRemove('fire_pensions', arr(plan.pensions));
  writeOrRemove('fire_life_events', arr(plan.lifeEvents));
  writeOrRemove('fire_debt_payments', arr(plan.debtPayments));
  writeOrRemove('fire_projected_milestones', arr(plan.projectedMilestones));
  writeOrRemove('fire_actuals', arr(plan.actuals));
  writeOrRemove('fire_coasting_mode', plan.coastingMode ?? {});
  writeOrRemove('fire_variable_inflation_rates', arr(plan.variableInflationRates));
  if (plan.strategyPreset) {
    localStorage.setItem('fire_strategy_preset', plan.strategyPreset);
  }
  if (plan.withdrawalStrategy) {
    localStorage.setItem('fire_withdrawal_strategy', plan.withdrawalStrategy);
  }
}

// === Offline queue ===

interface PendingWrite {
  plan: Plan;
  enqueuedAt: number;
}

let offlineQueue: PendingWrite[] = [];
let queueFlushScheduled = false;

/**
 * Enqueue a plan write that failed with a network error. The queue is
 * flushed on the next successful save or on sign-in.
 */
export function enqueueOfflineWrite(plan: Plan): void {
  offlineQueue.push({ plan, enqueuedAt: Date.now() });
  if (!queueFlushScheduled && typeof window !== 'undefined') {
    queueFlushScheduled = true;
    window.addEventListener('online', flushOfflineQueue, { once: true });
  }
}

async function flushOfflineQueue(): Promise<void> {
  queueFlushScheduled = false;
  if (offlineQueue.length === 0) return;
  // Only flush when a user is signed in.
  const auth = getAuthInstance();
  if (!auth?.currentUser) return;
  // Send the newest write; older ones are superseded.
  const newest = offlineQueue[offlineQueue.length - 1];
  offlineQueue = [];
  try {
    await savePlan(newest.plan);
  } catch {
    // Still offline or auth gone — re-enqueue so we can retry later.
    offlineQueue.push(newest);
    if (!queueFlushScheduled && typeof window !== 'undefined') {
      queueFlushScheduled = true;
      window.addEventListener('online', flushOfflineQueue, { once: true });
    }
  }
}
