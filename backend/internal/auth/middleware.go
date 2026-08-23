// Package auth provides ID-token verification middleware.
//
// The middleware extracts the Firebase ID token from the `Authorization:
// Bearer <token>` header, verifies it with the Firebase Admin SDK, and
// attaches the decoded UID/email to the request context. Handlers read
// the verified UID from the context — they never trust a client-supplied
// user ID.
package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"firebase.google.com/go/v4/auth"
)

// AuthClient is the subset of *auth.Client used by the backend. Defined
// as an interface so we can stub it in tests.
type AuthClient interface {
	VerifyIDToken(ctx context.Context, token string) (*auth.Token, error)
	DeleteUser(ctx context.Context, uid string) error
}

// contextKey is an unexported type to prevent collisions in context values.
type contextKey struct{ name string }

var uidKey = &contextKey{"uid"}

// UIDFrom returns the verified UID attached to the request context by
// RequireAuth. Panics if the middleware wasn't applied — handlers are
// always registered behind RequireAuth, so this should never happen in
// practice.
func UIDFrom(ctx context.Context) string {
	uid, ok := ctx.Value(uidKey).(string)
	if !ok {
		panic("auth.UIDFrom: request context missing UID; did you forget RequireAuth?")
	}
	return uid
}

// RequireAuth returns an HTTP middleware that verifies the Firebase ID
// token on every request. On success it attaches the UID and email to
// the request context and forwards to the next handler; on failure it
// responds 401 with a structured error body and stops the chain.
func RequireAuth(client AuthClient) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if header == "" || !strings.HasPrefix(header, "Bearer ") {
				writeAuthError(w, "missing-token", "Missing or malformed Authorization header.", http.StatusUnauthorized)
				return
			}
			idToken := strings.TrimSpace(header[len("Bearer "):])
			if idToken == "" {
				writeAuthError(w, "missing-token", "Authorization header is empty.", http.StatusUnauthorized)
				return
			}

			tok, err := client.VerifyIDToken(r.Context(), idToken)
			if err != nil {
				code := "auth/invalid-token"
				msg := "ID token verification failed."
				// Surface a more specific message for the common cases.
				if errCtx := errToCode(err); errCtx != "" {
					code = errCtx
					switch errCtx {
					case "auth/id-token-expired":
						msg = "ID token has expired. Please sign in again."
					case "auth/argument-error":
						msg = "ID token is malformed."
					case "auth/revoked-id-token":
						msg = "ID token has been revoked. Please sign in again."
					}
				}
				writeAuthError(w, code, msg, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), uidKey, tok.UID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// errToCode extracts a Firebase-auth-style error code from an error, if
// available. The Admin SDK uses error types with Code() methods for some
// error paths and plain errors for others.
func errToCode(err error) string {
	// The Firebase Admin Go SDK exposes error codes via typed errors in
	// some paths; for v1 we do a best-effort string match on Error().
	s := err.Error()
	switch {
	case strings.Contains(s, "ID token has expired"):
		return "auth/id-token-expired"
	case strings.Contains(s, "malformed"):
		return "auth/argument-error"
	case strings.Contains(s, "revoked"):
		return "auth/revoked-id-token"
	default:
		return ""
	}
}

func writeAuthError(w http.ResponseWriter, code, msg string, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"error": map[string]string{"code": code, "message": msg},
	})
}
