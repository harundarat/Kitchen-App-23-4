import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../context/userContext";

function SessionFallback() {
  return (
    <main
      className="flex min-h-svh items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="border-primary/20 border-t-primary h-10 w-10 animate-spin rounded-full border-4" />
      <span className="sr-only">Memuat sesi...</span>
    </main>
  );
}

function ProtectedOutlet({ revalidating }: { revalidating: boolean }) {
  return (
    <>
      <div
        className={revalidating ? "hidden" : "contents"}
        hidden={revalidating}
        inert={revalidating}
        aria-hidden={revalidating || undefined}
      >
        <Outlet />
      </div>
      {revalidating && <SessionFallback />}
    </>
  );
}

export function RequireAdmin() {
  const location = useLocation();
  const { isAdmin, status, user } = useUser();
  const revalidating = status === "loading" && user?.role === "admin";

  if (status === "loading") {
    return revalidating ? (
      <ProtectedOutlet revalidating />
    ) : (
      <SessionFallback />
    );
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <ProtectedOutlet revalidating={false} />;
}

export function RequireUser() {
  const { isUser, status, user } = useUser();
  const revalidating = status === "loading" && user?.role === "user";

  if (status === "loading") {
    return revalidating ? (
      <ProtectedOutlet revalidating />
    ) : (
      <SessionFallback />
    );
  }
  if (!isUser) return <Navigate to="/" replace />;
  return <ProtectedOutlet revalidating={false} />;
}
