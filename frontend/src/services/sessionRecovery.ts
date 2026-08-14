export type SessionRole = "user" | "admin";

export interface SessionValidation {
  role: SessionRole;
  invalidStatuses?: readonly number[];
}

type SessionInvalidationListener = () => void;
type SessionChangeListener = () => void;

export const SESSION_CHANGE_CHANNEL_NAME = "kitchencraft:session";
export const SESSION_CHANGED_MESSAGE = "session-changed";

const invalidationListeners: Record<
  SessionRole,
  Set<SessionInvalidationListener>
> = {
  user: new Set(),
  admin: new Set(),
};

const sessionChangeListeners = new Set<SessionChangeListener>();
let sessionChangeChannel: BroadcastChannel | undefined;

function getSessionChangeChannel(): BroadcastChannel | null {
  if (sessionChangeChannel) return sessionChangeChannel;

  if (typeof BroadcastChannel === "undefined") return null;

  try {
    sessionChangeChannel = new BroadcastChannel(SESSION_CHANGE_CHANNEL_NAME);
    sessionChangeChannel.addEventListener("message", (event) => {
      if (event.data !== SESSION_CHANGED_MESSAGE) return;
      sessionChangeListeners.forEach((listener) => listener());
    });
  } catch {
    return null;
  }

  return sessionChangeChannel;
}

export const USER_SESSION_VALIDATION = {
  role: "user",
} as const satisfies SessionValidation;

export const CURRENT_USER_SESSION_VALIDATION = {
  role: "user",
  invalidStatuses: [401, 403, 404],
} as const satisfies SessionValidation;

export const ADMIN_SESSION_VALIDATION = {
  role: "admin",
} as const satisfies SessionValidation;

export function subscribeToSessionInvalidations(
  role: SessionRole,
  listener: SessionInvalidationListener,
): () => void {
  invalidationListeners[role].add(listener);
  return () => {
    invalidationListeners[role].delete(listener);
  };
}

export function reportSessionInvalidation(role: SessionRole): void {
  invalidationListeners[role].forEach((listener) => listener());
}

export function subscribeToSessionChanges(
  listener: SessionChangeListener,
): () => void {
  sessionChangeListeners.add(listener);
  getSessionChangeChannel();
  return () => {
    sessionChangeListeners.delete(listener);
  };
}

export function notifySessionChanged(): void {
  try {
    getSessionChangeChannel()?.postMessage(SESSION_CHANGED_MESSAGE);
  } catch {
    // Focus and visibility revalidation remain the correctness fallback.
  }
}
