# Retirement Dashboard backend

Go HTTP server that mediates all Firestore access for the client.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | none | Liveness check |
| GET | `/api/plan` | required | Load the authenticated user's plan |
| PUT | `/api/plan` | required | Save the authenticated user's plan |
| POST | `/api/claim-anonymous-plan` | required | Atomically claim an anonymous plan on first sign-in (write-if-absent) |
| DELETE | `/api/account` | required | Delete all user data and the Firebase Auth user |

All authenticated endpoints require an `Authorization: Bearer <id-token>` header, where the ID token is obtained from the Firebase Auth client SDK on the browser. The backend verifies the token with the Firebase Admin SDK and rejects requests with missing, malformed, or expired tokens (HTTP 401).

## Run locally

```bash
# One-time: obtain a service account key from Google Cloud Console
# (IAM → Service Accounts → create key → JSON) and set the env var:
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json

cd backend
go mod tidy
go run .
```

The server listens on `:8080` (override with `PORT`). CORS allows the Vite dev server at `http://localhost:5173` by default; override with `ALLOWED_ORIGINS=https://your-domain.com`.

Point the client at the local backend by setting `VITE_API_BASE_URL=http://localhost:8080` in the client's `.env`.

## Deploy to Cloud Run

```bash
cd backend

# Build and push the container to Artifact Registry.
gcloud builds submit --tag gcr.io/<PROJECT_ID>/retirement-dashboard-backend

# Deploy to Cloud Run. The --no-allow-unauthenticated flag means the
# service is private; the client calls it over HTTPS with an IAM token
# at the network boundary, but the per-request Firebase ID token is the
# real authorization mechanism (so unauthenticated is fine here).
gcloud run deploy retirement-dashboard-backend \
  --image gcr.io/<PROJECT_ID>/retirement-dashboard-backend \
  --region us-west1 \
  --allow-unauthenticated \
  --set-env-vars="ALLOWED_ORIGINS=https://your-frontend-domain.com"
```

After deploy, update `VITE_API_BASE_URL` in the client's `.env` to the Cloud Run URL printed by the deploy command.

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP listen port |
| `GOOGLE_APPLICATION_CREDENTIALS` | (auto-detected) | Path to a service account JSON key. Not needed on Cloud Run. |
| `ALLOWED_ORIGINS` | localhost dev URLs | Comma-separated CORS origin allowlist |

## Tests

```bash
go test ./...
```

(No tests are written yet — see the OpenSpec tasks.md for the placeholder.)
