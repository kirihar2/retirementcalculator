/**
 * Cloud-sync hook.
 *
 * Subscribes to auth state changes and, when the user is signed in,
 * syncs the local plan with the backend:
 *
 * - On sign-in: fetches the backend plan and reconciles with localStorage.
 *   If the user is claiming an anonymous plan for the first time, calls
 *   the claim endpoint instead.
 * - On every localStorage mutation (observed via a storage event and a
 *   manual trigger): pushes the aggregated plan to the backend.
 *
 * The hook is a no-op when the auth feature flag is off.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseEnabled } from '../services/firebase';
import {
  aggregateLocalPlan,
  applyRemotePlan,
  claimAnonymousPlan,
  enqueueOfflineWrite,
  isEmptyPlan,
  loadPlan,
  savePlan,
  UserDataError,
} from '../services/userData';
import type { Plan } from '../types/plan';

const CLAIM_FLAG_PREFIX = 'claimedAnonymousPlan:';

function claimFlagKeyFor(uid: string): string {
  return `${CLAIM_FLAG_PREFIX}${uid}`;
}

export interface CloudSyncState {
  /** True while the initial sign-in reconciliation is in flight. */
  reconciling: boolean;
  /** One-time banner message to surface to the user (merge / claim notice). */
  banner: string | null;
  /** Clear the banner. */
  dismissBanner: () => void;
  /** True when the browser is offline AND a user is signed in. */
  offline: boolean;
  /** Manually trigger a sync push (e.g., after a mutation in FIRECalculator). */
  pushNow: () => void;
  /** Plan loaded from backend during reconciliation. Components should use this to update state. */
  remotePlan: Plan | null;
}

export function useCloudSync(): CloudSyncState {
  const { user } = useAuth();
  const [reconciling, setReconciling] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [offline, setOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [remotePlan, setRemotePlan] = useState<Plan | null>(null);
  const lastUidRef = useRef<string | null>(null);
  const pushTimerRef = useRef<number | null>(null);

  // Track online/offline status.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Reconcile on sign-in. Runs once per UID transition.
  useEffect(() => {
    if (!isFirebaseEnabled()) return;
    const uid = user?.uid ?? null;
    if (uid === lastUidRef.current) return;
    lastUidRef.current = uid;
    if (!uid) {
      setReconciling(false);
      return;
    }

    (async () => {
      setReconciling(true);
      try {
        const claimFlagKey = claimFlagKeyFor(uid);
        const alreadyClaimed = localStorage.getItem(claimFlagKey) === 'true';
        const localPlan = aggregateLocalPlan();

        if (!alreadyClaimed && localPlan) {
          // First sign-in with a local plan — attempt to claim.
          const result = await claimAnonymousPlan(localPlan);
          if (result.claimed) {
            localStorage.setItem(claimFlagKey, 'true');
            setBanner('Your local plan has been saved to your account.');
          } else if (result.existingPlan) {
            // Backend had an existing plan — reconcile by updatedAt.
            setRemotePlan(result.existingPlan);
            localStorage.setItem(claimFlagKey, 'true');
            const localUpdatedAt = guessLocalUpdatedAt();
            const remoteUpdatedAt = result.existingPlan.updatedAt;
            if (remoteUpdatedAt && (!localUpdatedAt || remoteUpdatedAt > localUpdatedAt)) {
              applyRemotePlan(result.existingPlan);
              setBanner("We kept the plan from your account (it's newer than your local copy).");
            } else {
              setBanner('We kept the existing cloud plan. Your local copy was not overwritten.');
            }
          }
        } else {
          // Standard reconciliation: fetch remote and compare.
          const remote = await loadPlan();
          if (remote) {
            setRemotePlan(remote);
          }
          if (remote && localPlan && !isEmptyPlan(localPlan)) {
            const localUpdatedAt = guessLocalUpdatedAt();
            const remoteUpdatedAt = remote.updatedAt;
            if (remoteUpdatedAt && (!localUpdatedAt || remoteUpdatedAt > localUpdatedAt)) {
              applyRemotePlan(remote);
              setBanner("We synced your plan from another device (it's newer).");
            } else if (localUpdatedAt && (!remoteUpdatedAt || localUpdatedAt > remoteUpdatedAt)) {
              await savePlan(localPlan);
              setBanner('We uploaded your local plan to your account.');
            }
          } else if (remote && !localPlan) {
            // Fresh device with no local data — bootstrap from remote.
            applyRemotePlan(remote);
          } else if (!remote && localPlan && !isEmptyPlan(localPlan)) {
            // Remote empty, local has data — push it up.
            await savePlan(localPlan);
          }
        }
      } catch (err) {
        // Network errors during reconciliation are non-fatal; the user
        // can still use the app offline and we'll retry on next sign-in.
        if (err instanceof UserDataError && err.code === 'network-error') {
          console.warn('Cloud sync: offline during reconciliation; will retry later.');
        } else {
          console.error('Cloud sync: reconciliation failed', err);
        }
      } finally {
        setReconciling(false);
      }
    })();
  }, [user]);

  // Push helper: debounced save to the backend.
  const pushNow = useCallback(() => {
    if (!isFirebaseEnabled()) return;
    const plan = aggregateLocalPlan();
    if (!plan || isEmptyPlan(plan)) return;
    savePlan(plan).catch((err) => {
      if (err instanceof UserDataError && err.code === 'network-error') {
        enqueueOfflineWrite(plan);
      } else if (err instanceof UserDataError && err.code === 'unauthenticated') {
        // User signed out between mutation and flush — silently drop.
      } else {
        console.error('Cloud sync: push failed', err);
      }
    });
  }, []);

  // Debounced push on localStorage mutations from this tab.
  useEffect(() => {
    if (!isFirebaseEnabled() || typeof window === 'undefined') return;
    const handler = () => {
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = window.setTimeout(() => {
        pushTimerRef.current = null;
        pushNow();
      }, 800);
    };
    window.addEventListener('storage', handler);
    // Also listen to a custom event so FIRECalculator can trigger a push
    // synchronously after a mutation without waiting for the debounce.
    window.addEventListener('fire-cloud-sync', pushNow);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('fire-cloud-sync', pushNow);
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
    };
  }, [pushNow]);

  const dismissBanner = useCallback(() => setBanner(null), []);

  return { reconciling, banner, dismissBanner, offline, pushNow, remotePlan };
}

/**
 * Best-effort local `updatedAt`: uses the `exportedAt` field if present
 * (from a prior export/import), otherwise falls back to a stored
 * timestamp we maintain on every successful push.
 */
function guessLocalUpdatedAt(): string | null {
  return localStorage.getItem('fire_cloud_sync_last_updated');
}
