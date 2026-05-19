import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const GUEST_COOKIE = "pmd_guest_id";

/**
 * Read or create a guest ID from the request cookies.
 * Returns [guestId, isNew] — isNew is true when a fresh ID was generated.
 */
export async function getOrCreateGuestId(): Promise<[string, boolean]> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(GUEST_COOKIE)?.value;
  if (existing) return [existing, false];
  const id = crypto.randomUUID();
  return [id, true];
}

/**
 * Set the guest ID cookie on the response.
 * Cookie is HttpOnly, SameSite=Lax, 30-day expiry.
 */
export function setGuestIdCookie(response: NextResponse, guestId: string): void {
  response.cookies.set(GUEST_COOKIE, guestId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}
