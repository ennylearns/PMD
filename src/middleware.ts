import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { checkAdminAccess } from "@/lib/middleware-logic";

const { auth } = NextAuth(authConfig);

export const middleware = auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const role = (req.auth?.user as any)?.role;
  const pathname = req.nextUrl.pathname;

  // 1. Admin access check
  const adminCheck = checkAdminAccess(pathname, isLoggedIn, role);
  if (adminCheck?.redirectUrl) {
    return Response.redirect(new URL(adminCheck.redirectUrl, req.nextUrl));
  }

  // 2. Customer dashboard/orders protection
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isOnOrders = pathname.startsWith("/orders");
  if ((isOnDashboard || isOnOrders) && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/orders/:path*", "/admin/:path*"],
};
