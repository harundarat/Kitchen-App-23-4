import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserContextProvider, useUser } from "../context/userContext";

function SessionProbe() {
  const { isLogged, user } = useUser();

  if (isLogged === null) return <p>Memuat sesi</p>;
  if (!user) return <p>Sesi anonim</p>;

  return <p>Sesi untuk {user.username}</p>;
}

describe("UserContextProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the resolved cookie-backed session", async () => {
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      new AbortController().signal,
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          user: { id: "user-1", username: "koki", role: "user" },
        }),
        { headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <UserContextProvider>
        <SessionProbe />
      </UserContextProvider>,
    );

    expect(await screen.findByText("Sesi untuk koki")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/auth$/),
      expect.objectContaining({ credentials: "include", method: "GET" }),
    );
  });
});
