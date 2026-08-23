# Firebase setup

This document walks through the Firebase-side setup required to enable user accounts and cloud sync for the Retirement Dashboard.

## Prerequisites

- A Google account
- The Firebase CLI installed globally: `npm install -g firebase-tools`
- Run `firebase login` once to authenticate the CLI

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com/> and click **Add project**.
2. Give it a name (e.g., `retirement-dashboard`). Disable Google Analytics if you don't need it.
3. Once created, click the web icon (`</>`) to add a Web app. Copy the config block — you'll need it in step 4.

## 2. Enable Authentication

1. In the Firebase console, go to **Build → Authentication → Get started**.
2. On the **Sign-in method** tab, enable **Email/Password**.
3. (Optional) In **Settings → Authorized domains**, verify your production domain is listed.

## 3. Enable Firestore

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Start in production mode** (the backend mediates all writes via Admin SDK).
3. Pick the region closest to your user base (e.g., `us-central1`, `eur3`).

## 4. Configure environment variables

Copy `.env.example` to `.env` and fill in the values from your Web app config:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ENABLE_AUTH=true
VITE_API_BASE_URL=https://us-central1-your-project-id.cloudfunctions.net
```

The backend uses the same project — no separate env is needed because Cloud Functions auto-inject the service account.

## 5. Harden the public API key

The Web API key in `VITE_FIREBASE_API_KEY` is public by design (it identifies the project, it's not a secret). To prevent abuse from other domains:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Select the API key that matches your Firebase Web API key.
3. Under **Application restrictions**, choose **HTTP referrers** and add your production domain patterns:
   - `https://yourdomain.com/*`
   - `https://*.yourdomain.com/*`
4. Under **API restrictions**, choose **Restrict key** and enable only the APIs your Firebase project uses (typically **Firebase Auth API**, **Cloud Firestore API**, **Firebase Installations API**, **Token Service API**).
5. Save. Changes take effect within a few minutes.

This means a stolen API key is only usable from your authorized domains.

## 6. Enable App Check (recommended)

App Check ties requests to your actual web app via reCAPTCHA v3, blocking scripted abuse.

1. In the Firebase console, go to **Build → App Check**.
2. Register your web app with the **reCAPTCHA v3** provider. You'll need a reCAPTCHA site key from <https://www.google.com/recaptcha/admin>.
3. In the Cloud Functions backend, initialize App Check before verifying ID tokens (see `functions/src/admin.ts`).

## 7. Deploy Firestore rules (defense-in-depth)

The backend bypasses security rules via the Admin SDK, but we keep rules correct as a second line of defense.

1. Edit `firestore.rules` at the repo root if needed.
2. Deploy: `firebase deploy --only firestore:rules`
3. Verify in the Firebase console's **Rules Playground** that:
   - A matching-UID read/write succeeds
   - A mismatched-UID read/write is denied
   - An unauthenticated read/write is denied

## 8. Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

After deployment, `VITE_API_BASE_URL` should point at the deployed functions URL (printed by the deploy command).

## 9. Local development with emulators

The Firebase emulators let you run Auth, Firestore, and Cloud Functions locally without touching production.

```bash
firebase emulators:start
```

The emulator UI is at <http://127.0.0.1:4000>. Set `VITE_API_BASE_URL=http://127.0.0.1:5001` in your local `.env`.

## Source of truth

- The **Firebase console** is the source of truth for deployed rules and function configuration.
- The files in this repo (`firestore.rules`, `functions/`, `firebase.json`) are for review/CI reference and manual deploys.
