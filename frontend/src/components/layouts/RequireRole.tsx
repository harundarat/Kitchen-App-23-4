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

export function RequireAdmin() {
  const location = useLocation();
  const { isAdmin, status } = useUser();

  if (status === "loading") return <SessionFallback />;
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export function RequireUser() {
  const { isUser, status } = useUser();

  if (status === "loading") return <SessionFallback />;
  if (!isUser) return <Navigate to="/" replace />;
  return <Outlet />;
}
