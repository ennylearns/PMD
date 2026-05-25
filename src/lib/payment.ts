import crypto from "crypto";

/**
 * Verify a Paystack webhook HMAC-SHA512 signature.
 * Paystack sends the hash of the raw request body signed with your secret key.
 *
 * @param rawBody   The raw request body string (must not be parsed/re-serialised)
 * @param signature The value of the `x-paystack-signature` header
 * @param secret    Your Paystack secret key
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}
