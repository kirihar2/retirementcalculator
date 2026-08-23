/**
 * Client-side mirror of the `Plan` type defined in
 * `functions/src/types.ts`. The client aggregates its flat localStorage
 * keys into this shape before sending to the backend, and unpacks the
 * response back into localStorage.
 *
 * The fields are intentionally permissive (`Record<string, unknown>` and
 * `unknown[]`) because the client does not re-validate the server's
 * response — the local state hooks own their own stricter types.
 */

export interface Plan {
  inputs: Record<string, unknown>;
  pensions: Array<Record<string, unknown>>;
  lifeEvents: Array<Record<string, unknown>>;
  debtPayments: Array<Record<string, unknown>>;
  projectedMilestones: Array<Record<string, unknown>>;
  actuals: Array<Record<string, unknown>>;
  coastingMode: Record<string, unknown>;
  variableInflationRates: Array<Record<string, unknown>>;
  strategyPreset?: string;
  withdrawalStrategy?: string;
}

export interface PlanDocument extends Plan {
  updatedAt: string; // ISO 8601 timestamp
  createdBy: string; // UID
}

export interface ClaimResponse {
  claimed: boolean;
  updatedAt?: string;
  existingPlan?: PlanDocument;
}
