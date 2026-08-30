import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import NotFound from "@/app/not-found";
import LandingPage from "@/app/(public)/page";
import { AccountScreen } from "@/features/account/account-screen";
import { useAuthStore } from "@/features/auth/store";
import { SignInScreen } from "@/features/auth/sign-in-screen";
import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { ComponentsScreen } from "@/features/master-data/components-screen";
import { VendorsScreen } from "@/features/master-data/vendors-screen";
import { ProjectsScreen } from "@/features/projects/projects-screen";
import { writeCookie } from "@/lib/cookies";
import { tokenCookieName } from "@/lib/env";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/dashboard/",
  useSearchParams: () => new URLSearchParams(),
}));

const admin = {
  id: "user-1",
  userName: "admin",
  fullName: "Strata Admin",
  email: "admin@strata.local",
  roleName: "admin",
  token: "token",
  validUntil: "2030-01-01T00:00:00",
  accessData: [],
};

function emptyEnvelope() {
  return {
    status: "success",
    statusCode: 200,
    message: "Success",
    data: [],
    meta: { totalData: 0, totalPage: 1, currentPage: 1, pageSize: 10, hasNextPage: false, hasPreviousPage: false },
  };
}

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

class QuietObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
});

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", QuietObserver);
  vi.stubGlobal("IntersectionObserver", QuietObserver);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(emptyEnvelope()), { status: 200, headers: { "Content-Type": "application/json" } })),
  );
  writeCookie(tokenCookieName(), "token");
  useAuthStore.setState({ user: admin, hydrated: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("every page can be drawn", () => {
  it("shows the landing page to a visitor", () => {
    render(<LandingPage />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/still works/i);
  });

  it("shows the sign-in page with a way in", () => {
    render(<SignInScreen />, { wrapper: Wrapper });
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows the dashboard", async () => {
    render(<DashboardScreen />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1, name: /hello|dashboard/i })).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalled());
  });

  it("shows the projects list", async () => {
    render(<ProjectsScreen />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1, name: /projects/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no projects yet/i)).toBeInTheDocument());
  });

  it("shows the vendors and components pages", async () => {
    const vendors = render(<VendorsScreen />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1, name: /vendors/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no vendors yet/i)).toBeInTheDocument());
    vendors.unmount();
    render(<ComponentsScreen />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1, name: /components/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/no components yet/i)).toBeInTheDocument());
  });

  it("shows account management to an administrator", async () => {
    render(<AccountScreen />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1, name: /account management/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/nobody yet/i)).toBeInTheDocument());
  });

  it("shows a way back from a missing page", () => {
    render(<NotFound />, { wrapper: Wrapper });
    expect(screen.getAllByRole("link", { name: /dashboard|back|home/i }).length).toBeGreaterThan(0);
  });
});
