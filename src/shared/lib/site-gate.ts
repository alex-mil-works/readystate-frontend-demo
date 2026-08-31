/** Soft site-gate session key (password unlock for this tab). */
export const SITE_GATE_STORAGE_KEY = 'readystate-site-gate';

type SiteGateListener = () => void;

const listeners = new Set<SiteGateListener>();

function notifySiteGateListeners() {
  for (const listener of listeners) listener();
}

/** Subscribe to unlock/lock changes (same-tab React re-render without reload). */
export function subscribeSiteGate(listener: SiteGateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isSiteGateUnlocked(): boolean {
  if (typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem(SITE_GATE_STORAGE_KEY) === 'ok';
}

export function unlockSiteGate(): void {
  sessionStorage.setItem(SITE_GATE_STORAGE_KEY, 'ok');
  notifySiteGateListeners();
}

/** Clear gate unlock — password form shows again when configured. */
export function lockSiteGate(): void {
  sessionStorage.removeItem(SITE_GATE_STORAGE_KEY);
  notifySiteGateListeners();
}
