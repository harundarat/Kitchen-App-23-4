import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

vi.mock("../context/userContext", () => ({
  UserContextProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("../components/layouts/ConsumerLayouts", async () => {
  const { Outlet } =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    ConsumerLayout: () => (
      <>
        <nav>Consumer navigation</nav>
        <Outlet />
        <footer>Consumer footer</footer>
      </>
    ),
    ConsumerEditorLayout: () => <Outlet />,
  };
});

vi.mock("../components/layouts/RequireRole", async () => {
  const { Outlet } =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    RequireAdmin: () => <Outlet />,
    RequireUser: () => <Outlet />,
  };
});

vi.mock("../components/layouts/AdminLayout", async () => {
  const { Outlet } =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return {
    default: () => (
      <main>
        <p>Admin navigation</p>
        <Outlet />
      </main>
    ),
  };
});

vi.mock("../pages/NotFound", () => ({
  default: () => <p>Consumer not found</p>,
}));

vi.mock("../pages/admin/AdminNotFound", () => ({
  default: () => <p>Admin not found</p>,
}));

describe("application catch-all routes", () => {
  it("renders unknown consumer routes inside the consumer shell", async () => {
    render(
      <MemoryRouter initialEntries={["/unknown-page"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Consumer not found")).toBeInTheDocument();
    expect(screen.getByText("Consumer navigation")).toBeInTheDocument();
    expect(screen.getByText("Consumer footer")).toBeInTheDocument();
    expect(screen.queryByText("Admin navigation")).not.toBeInTheDocument();
  });

  it("keeps unknown admin routes inside the admin shell", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/unknown-page"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Admin not found")).toBeInTheDocument();
    expect(screen.getByText("Admin navigation")).toBeInTheDocument();
    expect(screen.queryByText("Consumer navigation")).not.toBeInTheDocument();
    expect(screen.queryByText("Consumer footer")).not.toBeInTheDocument();
  });
});
