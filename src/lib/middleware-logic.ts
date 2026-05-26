export function checkAdminAccess(
  pathname: string,
  isLoggedIn: boolean,
  userRole?: string
): { redirectUrl?: string } | null {
  const isOnAdmin = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isOnAdmin && !isLoginPage) {
    if (!isLoggedIn) {
      return { redirectUrl: `/admin/login?callbackUrl=${encodeURIComponent(pathname)}` };
    }
    if (userRole !== "ADMIN") {
      return { redirectUrl: "/" };
    }
  }

  return null;
}
