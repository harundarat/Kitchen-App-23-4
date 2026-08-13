import { Icon } from "@iconify/react";
import {
  Drawer,
  DrawerItems,
  Sidebar,
  SidebarItemGroup,
  SidebarItems,
} from "flowbite-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "../../context/userContext";
import { getErrorMessage } from "../../services/api";

const navigation = [
  {
    icon: "solar:users-group-rounded-linear",
    label: "Pengguna",
    to: "/admin/users",
  },
  { icon: "solar:chef-hat-linear", label: "Resep", to: "/admin/recipes" },
] as const;

interface NavigationProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

function AdminNavigation({ collapsed = false, onNavigate }: NavigationProps) {
  return (
    <Sidebar
      className="h-full w-full border-0 bg-transparent p-0 [&>div]:h-full [&>div]:rounded-none [&>div]:bg-transparent [&>div]:p-3"
      aria-label="Navigasi admin"
    >
      <div className="flex h-full flex-col">
        <NavLink
          to="/admin/users"
          end
          onClick={onNavigate}
          className="focus-visible:outline-primary mb-6 flex items-center gap-3 rounded-lg px-2 py-2 focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="KitchenCraft Admin"
        >
          <img
            src="/kitchen-craft-logo.svg"
            alt=""
            className="h-8 w-8 shrink-0"
          />
          {!collapsed && (
            <span className="text-primary text-lg font-bold">KitchenCraft</span>
          )}
        </NavLink>
        <SidebarItems className="flex-1">
          <SidebarItemGroup className="space-y-2 border-0 pt-0">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `focus-visible:outline-primary flex items-center gap-3 rounded-lg px-3 py-3 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      isActive
                        ? "bg-accent-2/15 text-primary"
                        : "text-primary hover:bg-primary/5"
                    }`
                  }
                >
                  <Icon icon={item.icon} width={22} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </SidebarItemGroup>
        </SidebarItems>
      </div>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user } = useUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      toast.success("Berhasil logout dari admin");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal logout"));
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="bg-bg min-h-svh">
      <aside
        className={`border-primary/10 bg-bg fixed inset-y-0 left-0 z-40 hidden border-r transition-[width] duration-200 lg:block ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <AdminNavigation collapsed={collapsed} />
      </aside>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        position="left"
        className="bg-bg w-72 p-0"
        aria-label="Menu navigasi admin"
      >
        <DrawerItems className="h-full p-3">
          <AdminNavigation onNavigate={() => setMobileOpen(false)} />
        </DrawerItems>
      </Drawer>

      <div
        className={`min-h-svh transition-[padding] duration-200 ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <header className="border-primary/10 bg-bg/95 sticky top-0 z-30 flex h-18 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="text-primary hover:bg-primary/5 focus-visible:outline-primary rounded-md p-2 focus-visible:outline-2 focus-visible:outline-offset-2 lg:hidden"
            aria-label="Buka navigasi admin"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Icon icon="solar:hamburger-menu-linear" width={24} />
          </button>
          <button
            type="button"
            className="text-primary hover:bg-primary/5 focus-visible:outline-primary hidden rounded-md p-2 focus-visible:outline-2 focus-visible:outline-offset-2 lg:inline-flex"
            aria-label={
              collapsed ? "Perluas navigasi admin" : "Ciutkan navigasi admin"
            }
            aria-expanded={!collapsed}
            onClick={() => setCollapsed((value) => !value)}
          >
            <Icon
              icon={
                collapsed
                  ? "solar:sidebar-minimalistic-outline"
                  : "solar:sidebar-minimalistic-linear"
              }
              width={22}
            />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-primary hidden text-sm sm:inline">
              {user?.username}
            </span>
            <button
              type="button"
              className="text-accent-1 border-accent-1/30 hover:bg-accent-1 hover:text-bg focus-visible:outline-accent-1 rounded-full border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
            >
              {loggingOut ? "Keluar..." : "Keluar"}
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
