// Package plan implements the plan CRUD endpoints.
//
// All handlers assume the caller is authenticated — the RequireAuth
// middleware runs first and attaches the verified UID to the request
// context. The UID is read via auth.UIDFrom; handlers never trust a
// client-supplied user ID.
package plan

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/retirementdashboard/backend/internal/auth"
	"github.com/retirementdashboard/backend/internal/types"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// FirestoreClient is the subset of *firestore.Client used by the
// backend. Defined as an interface so handlers can be unit-tested
// without a real Firestore connection. The *firestore.Client concrete
// type satisfies this interface implicitly.
//
// Methods needed:
//   - Doc(path): returns a DocumentRef for direct reads/writes
//   - RunTransaction: executes a transaction for atomic read-then-write
//     operations (used by the claim endpoint)
type FirestoreClient interface {
	Doc(path string) *firestore.DocumentRef
	RunTransaction(ctx context.Context, update func(context.Context, *firestore.Transaction) error, opts ...firestore.TransactionOption) error
}

const planPathPrefix = "users/"
const planPathSuffix = "/plans/primary"

func planDocPath(uid string) string {
	return planPathPrefix + uid + planPathSuffix
}

// GetHandler returns GET /api/plan — the authenticated user's plan, or
// 404 if none exists.
func GetHandler(fs FirestoreClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := auth.UIDFrom(r.Context())
		snap, err := fs.Doc(planDocPath(uid)).Get(r.Context())
		if err != nil {
			if isNotFound(err) {
				writeError(w, "not-found", "No plan found for this user.", http.StatusNotFound)
				return
			}
			log.Printf("plan.GetHandler: firestore error: %v", err)
			writeError(w, "internal-error", "Failed to load plan.", http.StatusInternalServerError)
			return
		}
		var doc types.PlanDocument
		if err := snap.DataTo(&doc); err != nil {
			log.Printf("plan.GetHandler: decode error: %v", err)
			writeError(w, "internal-error", "Failed to decode plan.", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(doc)
	}
}

// PutHandler returns PUT /api/plan — write the authenticated user's plan.
// Performs a basic shape check (must be a JSON object) and stamps
// `updatedAt` / `createdBy` metadata before writing.
func PutHandler(fs FirestoreClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := auth.UIDFrom(r.Context())
		var body types.Plan
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, "invalid-payload", "Request body must be a JSON object.", http.StatusBadRequest)
			return
		}

		doc := types.PlanDocument{
			Plan:      body,
			UpdatedAt: time.Now().UTC().Format(time.RFC3339),
			CreatedBy: uid,
		}

		if _, err := fs.Doc(planDocPath(uid)).Set(r.Context(), doc); err != nil {
			log.Printf("plan.PutHandler: firestore error: %v", err)
			writeError(w, "internal-error", "Failed to save plan.", http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, map[string]string{
			"status":    "ok",
			"updatedAt": doc.UpdatedAt,
		})
	}
}

// ClaimHandler returns POST /api/claim-anonymous-plan — write the plan
// only if no plan already exists for this user. Uses a Firestore
// transaction to make the write-if-absent atomic.
//
// Returns `{ claimed: true, updatedAt }` on success, or
// `{ claimed: false, existingPlan: {...} }` when the user already had a
// plan. The client uses the latter to reconcile by updatedAt.
func ClaimHandler(fs FirestoreClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := auth.UIDFrom(r.Context())
		var body types.Plan
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, "invalid-payload", "Request body must be a JSON object.", http.StatusBadRequest)
			return
		}

		var result types.ClaimResponse
		ref := fs.Doc(planDocPath(uid))
		err := fs.RunTransaction(r.Context(), func(ctx context.Context, tx *firestore.Transaction) error {
			snap, err := tx.Get(ref)
			if err != nil && !isNotFound(err) {
				return err
			}
			if err == nil && snap.Exists() {
				var existing types.PlanDocument
				if err := snap.DataTo(&existing); err != nil {
					return err
				}
				result = types.ClaimResponse{Claimed: false, ExistingPlan: &existing}
				return nil
			}
			doc := types.PlanDocument{
				Plan:      body,
				UpdatedAt: time.Now().UTC().Format(time.RFC3339),
				CreatedBy: uid,
			}
			if err := tx.Set(ref, doc); err != nil {
				return err
			}
			result = types.ClaimResponse{Claimed: true, UpdatedAt: doc.UpdatedAt}
			return nil
		})
		if err != nil {
			log.Printf("plan.ClaimHandler: transaction error: %v", err)
			writeError(w, "internal-error", "Failed to claim plan.", http.StatusInternalServerError)
			return
		}
		writeJSON(w, http.StatusOK, result)
	}
}

// isNotFound returns true when err is a Firestore "document not found"
// error, detected via the gRPC status code.
func isNotFound(err error) bool {
	if err == nil {
		return false
	}
	if s, ok := status.FromError(err); ok {
		return s.Code() == codes.NotFound
	}
	return false
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, code, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(types.APIError{
		Error: types.ErrorBody{Code: code, Message: msg},
	})
}
