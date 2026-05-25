import crypto from "crypto";
import { describe, it, expect } from "vitest";
import { verifyPaystackSignature } from "./payment";

const SECRET = "test-paystack-secret";
const BODY = JSON.stringify({ event: "charge.success", data: { reference: "ref-123" } });
const VALID_SIG = crypto.createHmac("sha512", SECRET).update(BODY).digest("hex");

describe("verifyPaystackSignature", () => {
  it("returns true for a valid HMAC-SHA512 signature", () => {
    expect(verifyPaystackSignature(BODY, VALID_SIG, SECRET)).toBe(true);
  });

  it("returns false when the body has been tampered with", () => {
    const tamperedBody = JSON.stringify({ event: "charge.success", data: { reference: "ref-HACKED" } });
    expect(verifyPaystackSignature(tamperedBody, VALID_SIG, SECRET)).toBe(false);
  });
});
