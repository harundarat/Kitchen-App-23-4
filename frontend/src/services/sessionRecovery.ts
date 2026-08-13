export type SessionRole = "user" | "admin";

export interface SessionValidation {
  role: SessionRole;
  invalidStatuses?: readonly number[];
}

type SessionInvalidationListener = () => void;

const invalidationListeners: Record<
  SessionRole,
  Set<SessionInvalidationListener>
> = {
  user: new Set(),
  admin: new Set(),
};

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
