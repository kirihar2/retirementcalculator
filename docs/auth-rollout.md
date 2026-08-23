# Auth rollout plan

This document describes how we're rolling out user accounts and cloud sync behind a feature flag, so we can dogfood safely and revert instantly if needed.

## Feature flag

The `VITE_ENABLE_AUTH` environment variable gates the entire auth + cloud-sync surface.

| Flag value | Behavior |
|---|---|
| `false` or unset (default) | Dashboard renders unconditionally for all visitors. No Firebase calls are made. The app behaves identically to pre-auth. |
| `true` | The auth gate is installed. Anonymous visitors see the sign-in screen. Signed-in users get cloud sync. |

## Rollout stages

### Stage 1 — Dogfood (flag OFF in production)

- Ship the code with `VITE_ENABLE_AUTH=false` in production.
- Developers and early testers run with `VITE_ENABLE_AUTH=true` locally.
- Verify:
  - The anonymous flow still works identically (no regressions).
  - The auth screens render correctly.
  - Cloud sync writes to Firestore as expected (via the emulator).
  - Account deletion clears everything.

### Stage 2 — Beta users (flag ON for a small audience)

- Flip `VITE_ENABLE_AUTH=true` for beta users via CDN-level config or a query-parameter override.
- Collect feedback on:
  - Sign-up friction
  - Sync reliability (check `fire_cloud_sync_last_updated` cadence)
  - Cold-start latency of Cloud Functions
- Monitor:
  - Firebase Auth signups per day
  - Firestore read/write units
  - Cloud Functions invocations and error rates
  - Cold-start p95 latency (Cloud Monitoring)

### Stage 3 — General availability (flag ON for all)

- Flip the flag on for all users in production.
- Keep the flag wired up for at least one release cycle so we can revert instantly if something goes wrong.
- Announce to users: a small banner on first sign-in explains the new cloud-sync behavior.

### Stage 4 — Flag removal (follow-up release)

- Once metrics are clean for 2+ weeks, remove the flag from `.env.example` and delete the `isFirebaseEnabled()` branches from the code.
- Keep `isFirebaseEnabled()` itself (returning `true` unconditionally) if we want to keep the escape hatch for future env-specific toggles, or remove it entirely if we're confident.

## Rollback playbook

If anything goes wrong at any stage, flip the flag back to `false`:

```bash
# For a CDN deploy: update the environment variable and redeploy.
# For a Vercel/Netlify deploy: toggle the env var in the dashboard and redeploy.
VITE_ENABLE_AUTH=false
```

This is a **one-line revert** that:

- Disables the auth gate (dashboard renders unconditionally)
- Skips all backend calls
- Preserves localStorage data (nothing is lost)
- Leaves Firestore data intact (still there when we flip the flag back on)

The Cloud Functions stay deployed but uninvoked — no cost, no cleanup needed.

## Metrics to watch

| Metric | Where | Alert threshold |
|---|---|---|
| Signups per day | Firebase console → Authentication → Users | Sudden drop to zero or 10× spike |
| Firestore read/write units | Firebase console → Firestore → Usage | Exceeding 80% of free tier |
| Cloud Functions invocations | GCP → Cloud Functions → Metrics | Error rate > 1% |
| Cold-start p95 latency | GCP → Cloud Monitoring | > 3s sustained |
| Sync errors (client console) | User reports + structured logging | Any persistent pattern |
