// Retirement Dashboard backend.
//
// A small Go HTTP server that mediates all Firestore access for the
// client. The client never talks to Firestore directly — it calls this
// server with a Firebase ID token in the Authorization header, and the
// server verifies the token with the Firebase Admin SDK before
// performing any data operation.
//
// Deploy target: Cloud Run (serverless containers). See Dockerfile and
// docs/firebase-setup.md for deployment instructions.
package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"firebase.google.com/go/v4"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"google.golang.org/api/option"

	"github.com/retirementdashboard/backend/internal/account"
	"github.com/retirementdashboard/backend/internal/auth"
	"github.com/retirementdashboard/backend/internal/plan"
)

func main() {
	ctx := context.Background()

	// Initialize the Firebase Admin SDK. When deployed to Cloud Run with a
	// service account attached, this picks up credentials automatically.
	// For local development, set GOOGLE_APPLICATION_CREDENTIALS to a
	// service account key file.
	var opts []option.ClientOption
	if credsFile := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"); credsFile != "" {
		opts = append(opts, option.WithCredentialsFile(credsFile))
	}
	firebaseApp, err := firebase.NewApp(ctx, nil, opts...)
	if err != nil {
		log.Fatalf("firebase.NewApp: %v", err)
	}

	authClient, err := firebaseApp.Auth(ctx)
	if err != nil {
		log.Fatalf("firebase.Auth: %v", err)
	}
	firestoreClient, err := firebaseApp.Firestore(ctx)
	if err != nil {
		log.Fatalf("firebase.Firestore: %v", err)
	}
	defer firestoreClient.Close()

	deps := &Dependencies{
		Auth:      authClient,
		Firestore: firestoreClient,
	}

	r := buildRouter(deps)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("http.ListenAndServe: %v", err)
	}
}

// Dependencies bundles the SDK clients used by handlers. Passed via
// closure-capturing route setup so handlers don't reach for globals.
//
// The interface types let us swap in fakes for tests without spinning up
// real Firebase clients.
type Dependencies struct {
	Auth      auth.AuthClient
	Firestore plan.FirestoreClient
}

func buildRouter(deps *Dependencies) http.Handler {
	r := chi.NewRouter()

	// Middleware stack: request logging, panic recovery, real-IP extraction,
	// and CORS (the client runs on a different origin in production).
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins(),
		AllowedMethods:   []string{"GET", "PUT", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Public endpoint — no auth required.
	r.Get("/api/health", handleHealth)

	// Authenticated endpoints — RequireAuth verifies the Firebase ID
	// token and attaches the decoded UID to the request context before
	// the handler runs.
	authMW := auth.RequireAuth(deps.Auth)
	r.With(authMW).Get("/api/plan", plan.GetHandler(deps.Firestore))
	r.With(authMW).Put("/api/plan", plan.PutHandler(deps.Firestore))
	r.With(authMW).Post("/api/claim-anonymous-plan", plan.ClaimHandler(deps.Firestore))
	r.With(authMW).Delete("/api/account", account.DeleteHandler(deps.Auth, deps.Firestore))

	return r
}

// handleHealth is a public liveness check.
func handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// writeJSON encodes v as JSON and writes it with the given status. Sets
// Content-Type. Logs but does not fail on encode errors (the response
// may already be partially written).
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		log.Printf("writeJSON: encode error: %v", err)
	}
}

// allowedOrigins returns the CORS origin allowlist. In production this
// should be the deployed frontend URL(s); for local dev we allow the
// Vite dev server. Reads from ALLOWED_ORIGINS (comma-separated) with a
// permissive local-dev default.
func allowedOrigins() []string {
	if raw := os.Getenv("ALLOWED_ORIGINS"); raw != "" {
		var out []string
		for _, o := range strings.Split(raw, ",") {
			if t := strings.TrimSpace(o); t != "" {
				out = append(out, t)
			}
		}
		if len(out) > 0 {
			return out
		}
	}
	// Local-dev defaults.
	return []string{
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"http://localhost:4173",
	}
}
