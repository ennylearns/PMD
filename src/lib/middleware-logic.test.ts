import { describe, it, expect } from "vitest";
import { checkAdminAccess } from "./middleware-logic";

describe("checkAdminAccess", () => {
  it("redirects unauthenticated users from /admin/dashboard to /admin/login", () => {
    const result = checkAdminAccess("/admin/dashboard", false);
    expect(result).toEqual({ redirectUrl: "/admin/login?callbackUrl=%2Fadmin%2Fdashboard" });
  });

  it("redirects authenticated CUSTOMER from /admin/dashboard to /", () => {
    const result = checkAdminAccess("/admin/dashboard", true, "CUSTOMER");
    expect(result).toEqual({ redirectUrl: "/" });
  });

  it("allows authenticated ADMIN to access /admin/dashboard", () => {
    const result = checkAdminAccess("/admin/dashboard", true, "ADMIN");
    expect(result).toBeNull();
  });

  it("allows unauthenticated users to access /admin/login", () => {
    const result = checkAdminAccess("/admin/login", false);
    expect(result).toBeNull(); // Shouldn't redirect away from login if not logged in
  });

  it("returns null for non-admin routes like /shop", () => {
    const result = checkAdminAccess("/shop", false);
    expect(result).toBeNull();
  });
});
