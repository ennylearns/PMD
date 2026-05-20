import { auth } from "@/lib/auth";
import { getOrCreateGuestId } from "@/lib/guest-id";

/**
 * Determine the cart owner identity.
 * Returns { userId, guestId, isNew } — exactly one of userId/guestId will be set.
 * `isNew` is true when a fresh guest ID was generated.
 */
export async function getCartOwner(): Promise<{
  userId: string | null;
  guestId: string | null;
  isNew: boolean;
}> {
  // Check for authenticated user first
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, guestId: null, isNew: false };
  }

  // Fall back to guest ID
  const [guestId, isNew] = await getOrCreateGuestId();
  return { userId: null, guestId, isNew };
}
