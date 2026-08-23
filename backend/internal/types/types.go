// Package types defines the shared data shapes used by the backend
// handlers. The client mirrors the Plan type in src/types/plan.ts.
package types

// Plan is the aggregated plan document stored per user at
// users/{uid}/plans/primary. Fields are intentionally permissive at the
// Go level (json.RawMessage) because the backend is a pass-through for
// the client's plan data — it doesn't need to interpret each field.
//
// Validation of individual field shapes is the client's responsibility;
// the backend only checks that the top-level shape is an object.
type Plan struct {
	Inputs               any `json:"inputs"`
	Pensions             any `json:"pensions"`
	LifeEvents           any `json:"lifeEvents"`
	DebtPayments         any `json:"debtPayments"`
	ProjectedMilestones  any `json:"projectedMilestones"`
	Actuals              any `json:"actuals"`
	CoastingMode         any `json:"coastingMode"`
	VariableInflationRates any `json:"variableInflationRates"`
	StrategyPreset       any `json:"strategyPreset,omitempty"`
	WithdrawalStrategy   any `json:"withdrawalStrategy,omitempty"`
}

// PlanDocument is a Plan plus server-managed metadata.
type PlanDocument struct {
	Plan
	UpdatedAt string `json:"updatedAt"`
	CreatedBy string `json:"createdBy"`
}

// ClaimResponse is the response from POST /api/claim-anonymous-plan.
type ClaimResponse struct {
	Claimed       bool          `json:"claimed"`
	UpdatedAt     string        `json:"updatedAt,omitempty"`
	ExistingPlan  *PlanDocument `json:"existingPlan,omitempty"`
}

// APIError is the standard error envelope returned by all endpoints.
type APIError struct {
	Error ErrorBody `json:"error"`
}

// ErrorBody carries a machine-readable code and a human-readable message.
type ErrorBody struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}
