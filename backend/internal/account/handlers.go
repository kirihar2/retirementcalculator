// Package account implements the DELETE /api/account endpoint.
//
// The endpoint deletes every document under users/{uid} and then
// deletes the Firebase Auth user. If the Firestore delete succeeds but
// the Auth delete fails, the endpoint returns 500 — the client surfaces
// the error and does NOT clear local state, so the user can retry.
package account

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/retirementdashboard/backend/internal/auth"
	"github.com/retirementdashboard/backend/internal/plan"
	"github.com/retirementdashboard/backend/internal/types"
)

// DeleteHandler returns DELETE /api/account.
//
// Deletes the known plan document at users/{uid}/plans/primary and then
// the Firebase Auth user. For v1 we have only one subcollection
// (`plans`) and one document within it (`primary`). If more data is
// added under the user's path later, this handler should be expanded.
func DeleteHandler(ac auth.AuthClient, fs plan.FirestoreClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uid := auth.UIDFrom(r.Context())
		ctx := r.Context()

		// Delete the plan document. Absence is not an error — a user
		// with no plan should still be deletable.
		planRef := fs.Doc("users/" + uid + "/plans/primary")
		if _, err := planRef.Delete(ctx); err != nil {
			log.Printf("account.DeleteHandler: plan delete: %v", err)
			writeError(w, "internal-error", "Failed to delete account data.", http.StatusInternalServerError)
			return
		}

		// Delete the Firebase Auth user. If this fails, the client
		// sees 500 and does not clear local state.
		if err := ac.DeleteUser(ctx, uid); err != nil {
			log.Printf("account.DeleteHandler: Auth delete failed after Firestore delete: %v", err)
			writeError(w, "auth-delete-failed",
				"Your data was deleted, but we could not delete your login. Please try again or contact support.",
				http.StatusInternalServerError)
			return
		}

		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	}
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
