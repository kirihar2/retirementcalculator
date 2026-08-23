# Deploy the backend to Cloud Run

The backend is a Go HTTP server deployed to Google Cloud Run as a container. This guide walks through the one-time setup and every subsequent deploy.

## Prerequisites

- A Google Cloud project with billing enabled (the same project as your Firebase project)
- Firebase project already configured — see [firebase-setup.md](./firebase-setup.md)
- The [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed and authenticated:
  ```bash
  gcloud init
  gcloud auth login
  ```
- The `gcloud` project set to your Firebase project:
  ```bash
  gcloud config set project <YOUR_PROJECT_ID>
  ```

## 1. Enable the required APIs

Run once per project:

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  firestore.googleapis.com \
  firebase.googleapis.com
```

| API | Why |
|---|---|
| Cloud Build | Builds the container image from the Dockerfile |
| Cloud Run | Hosts the serverless container |
| Artifact Registry | Stores the container image |
| Firestore | The backend reads/writes user plans |
| Firebase | Admin SDK needs the Firebase APIs for Auth verification |

## 2. Create a service account for the backend

Cloud Run needs a service account that can talk to Firestore and verify Firebase Auth tokens. Create one:

```bash
gcloud iam service-accounts create backend-sa \
  --display-name="Retirement Dashboard Backend"
```

Grant it the roles it needs:

```bash
SERVICE_ACCOUNT=backend-sa@$(gcloud config get-value project).iam.gserviceaccount.com

# Firestore read/write — the backend stores plans under users/{uid}/plans/primary
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/datastore.user"

# Firebase Auth — lets the Admin SDK verify ID tokens, delete users, etc.
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/firebaseauth.admin"
```

> **Why `roles/datastore.user` and not `roles/datastore.owner`?** The `.user` role allows reads and writes but not schema/deletion operations. The backend only does document CRUD — it doesn't need to manage indexes or delete collections. Use `.owner` only if you plan to run admin migrations through the same account.

## 3. Build and push the container

From the repo root:

```bash
cd backend

gcloud builds submit \
  --tag us-central1-docker.pkg.dev/$(gcloud config get-value project)/retirement-dashboard/backend \
  .
```

This runs Cloud Build, which reads `backend/Dockerfile`, builds a static Go binary, and pushes the image to Artifact Registry. First run may prompt you to create the repository — accept the default.

If you get a "repository not found" error on the first push, create it:

```bash
gcloud artifacts repositories create retirement-dashboard \
  --repository-format=docker \
  --location=us-central1
```

Then re-run the `gcloud builds submit` command.

## 4. Deploy to Cloud Run

```bash
gcloud run deploy retirement-dashboard-backend \
  --image us-central1-docker.pkg.dev/$(gcloud config get-value project)/retirement-dashboard/backend \
  --region us-central1 \
  --service-account backend-sa@$(gcloud config get-value project).iam.gserviceaccount.com \
  --allow-unauthenticated \
  --set-env-vars="ALLOWED_ORIGINS=https://your-frontend-domain.com"
```

Flag-by-flag:

| Flag | Value | Why |
|---|---|---|
| `--image` | The Artifact Registry path from step 3 | Which container to run |
| `--region` | `us-central1` | Pick the region closest to your users. Must match your Firestore region for lowest latency. |
| `--service-account` | The SA from step 2 | Lets the container talk to Firestore and Auth without a key file |
| `--allow-unauthenticated` | — | The endpoint is public HTTPS; per-request auth is via Firebase ID tokens in the `Authorization` header, not IAM. See "Security model" below. |
| `--set-env-vars` | `ALLOWED_ORIGINS=...` | CORS allowlist — must include your frontend domain(s) |

The deploy prints the service URL when done — it looks like `https://retirement-dashboard-backend-abc123-uc.a.run.app`.

## 5. Wire the frontend to the backend

Update `.env` (and `.env.production` if you have one) with the Cloud Run URL:

```
VITE_API_BASE_URL=https://retirement-dashboard-backend-abc123-uc.a.run.app
```

Then rebuild and redeploy your frontend. For the Vite dev server, restart `npm run dev` — env vars are read at startup.

## 6. Verify the deploy

```bash
# Health check — no auth needed
curl https://retirement-dashboard-backend-abc123-uc.a.run.app/api/health
# → {"status":"ok"}

# Authenticated endpoint without a token — should be 401
curl https://retirement-dashboard-backend-abc123-uc.a.run.app/api/plan
# → {"error":{"code":"unauthenticated","message":"..."}}
```

Open the app in the browser, sign in, and confirm the plan syncs (check the Firestore console — a doc should appear at `users/<uid>/plans/primary`).

## 7. View logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=retirement-dashboard-backend" --limit 50 --format json
```

Or in the console: **Cloud Run → retirement-dashboard-backend → Logs**.

## 8. Subsequent deploys

Every time you change the backend code:

```bash
cd backend

# 1. Rebuild and push
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/$(gcloud config get-value project)/retirement-dashboard/backend \
  .

# 2. Deploy the new image
gcloud run deploy retirement-dashboard-backend \
  --image us-central1-docker.pkg.dev/$(gcloud config get-value project)/retirement-dashboard/backend \
  --region us-central1
```

You only need to re-pass `--service-account` and `--set-env-vars` when they change — Cloud Run preserves them across deploys.

To change environment variables without rebuilding:

```bash
gcloud run services update retirement-dashboard-backend \
  --region us-central1 \
  --update-env-vars="ALLOWED_ORIGINS=https://new-domain.com,ANOTHER_VAR=value"
```

## 9. Local development against production Firebase

If you want to run the backend locally but talk to the production Firestore (useful for debugging):

```bash
cd backend
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
export ALLOWED_ORIGINS=http://localhost:5173
go run .
```

To get the key file: **Google Cloud Console → IAM → Service Accounts → `backend-sa` → Keys → Add Key → Create new key → JSON**. Keep this file out of git.

> Don't run local development against production Firestore routinely — you can accidentally overwrite real user data. Use the Firebase emulators (`firebase emulators:start`) for everyday development.

## Environment variable reference

| Variable | Default | Required on Cloud Run | Purpose |
|---|---|---|---|
| `PORT` | `8080` | No (Cloud Run sets it) | HTTP listen port |
| `ALLOWED_ORIGINS` | `http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:4173` | Yes | Comma-separated CORS origin allowlist — must include your frontend URL |
| `GOOGLE_APPLICATION_CREDENTIALS` | (auto-detected) | No | Path to service account JSON key. Only needed for local dev. On Cloud Run, the attached service account is used automatically. |

## Security model

The Cloud Run service is deployed with `--allow-unauthenticated` because the network boundary is not the auth mechanism. Here's why that's safe:

- **Per-request auth**: Every data endpoint requires a Firebase ID token in the `Authorization: Bearer` header. The backend verifies it with the Firebase Admin SDK before doing anything.
- **No sensitive data at rest in the container**: The container image has no API keys or secrets. The service account is attached to the Cloud Run service, not baked into the image.
- **Firestore defense-in-depth**: The `firestore.rules` file restricts `users/{uid}/**` to matching UIDs, so even if someone bypasses the backend, they can only read their own data.

If you want network-level restriction too (e.g., only your frontend's IP range), you can put Cloud Run behind a Serverless NEG + Cloud Armor, or switch to `--no-allow-unauthenticated` and have the frontend authenticate at the IAM layer too. For most apps the per-request Firebase ID token is sufficient.

## Troubleshooting

**"permission denied" on `gcloud builds submit`**
Make sure Cloud Build's service account has permission to write to Artifact Registry:
```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
  --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"
```

**Container crashes on startup with "firebase.NewApp: ..."**
The service account attached to the Cloud Run service doesn't have the Firebase Auth or Firestore roles. Double-check step 2.

**CORS errors in the browser**
`ALLOWED_ORIGINS` doesn't include your frontend URL. Update it:
```bash
gcloud run services update retirement-dashboard-backend \
  --region us-central1 \
  --update-env-vars="ALLOWED_ORIGINS=https://your-domain.com"
```

**401 on every request even with a valid token**
Check that the Firebase project ID in the client's `.env` (`VITE_FIREBASE_PROJECT_ID`) matches the project the backend's service account belongs to. The ID token is issued by one project and must be verified by the same project's Admin SDK.

**"repository not found" on first `gcloud builds submit`**
Create the Artifact Registry repository (see step 3) and retry.
