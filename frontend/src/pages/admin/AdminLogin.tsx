import { Icon } from "@iconify/react";
import { Label, TextInput } from "flowbite-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import RoundedButton from "../../components/common/RoundedButton";
import { useUser } from "../../context/userContext";
import { getErrorMessage } from "../../services/api";
import { adminService } from "../../services/admin";

interface AdminLocationState {
  from?: { pathname?: string; search?: string; hash?: string };
}

function requestedAdminPath(state: unknown): string {
  const from = (state as AdminLocationState | null)?.from;
  if (!from?.pathname?.startsWith("/admin")) return "/admin/users";
  return `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`;
}

export default function AdminLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isUser, refreshSession, status } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const destination = requestedAdminPath(location.state);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) {
      navigate(destination, { replace: true });
    }
  }, [destination, isAdmin, navigate, status]);

  if (status === "loading") return <LoginFallback />;
  if (isAdmin) return <Navigate to={destination} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Isi email dan kata sandi administrator.");
      return;
    }

    try {
      setSubmitting(true);
      await adminService.login(form);
      const refreshedSession = await refreshSession({
        notifyOtherTabs: true,
      });
      if (refreshedSession.user?.role !== "admin") {
        if (!refreshedSession.error) {
          toast.error("Sesi administrator tidak dapat dikonfirmasi");
        }
        return;
      }
      toast.success("Login administrator berhasil");
    } catch (error) {
      toast.error(getErrorMessage(error, "Login administrator gagal"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <section className="border-primary/10 bg-bg w-full max-w-[420px] rounded-2xl border p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <img
            src="/kitchen-craft-logo.svg"
            alt="KitchenCraft"
            className="h-11 w-11"
          />
          <div>
            <p className="text-primary text-xl font-bold">Masuk Admin</p>
            <p className="text-primary/65 text-sm">KitchenCraft</p>
          </div>
        </div>
        {isUser && (
          <div className="border-accent-2/30 bg-accent-2/10 text-primary mb-5 rounded-lg border p-3 text-sm">
            Login sebagai administrator akan menggantikan sesi pengguna saat
            ini.
          </div>
        )}
        <form className="space-y-5" onSubmit={submit}>
          <div>
            <Label htmlFor="admin-email">Email administrator</Label>
            <TextInput
              id="admin-email"
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="admin-password">Kata sandi</Label>
            <TextInput
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              required
              className="mt-2"
            />
          </div>
          <RoundedButton
            type="submit"
            name={submitting ? "Memeriksa..." : "Masuk sebagai admin"}
            className="w-full py-2"
            disabled={submitting}
          />
        </form>
      </section>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="flex min-h-svh items-center justify-center" role="status">
      <Icon
        icon="svg-spinners:180-ring-with-bg"
        className="text-primary"
        width={40}
      />
      <span className="sr-only">Memuat sesi...</span>
    </main>
  );
}
