import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock next-auth
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

import { auth } from "@/lib/auth";

describe("POST /api/upload", () => {
  it("should reject unauthorized requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null);

    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: JSON.stringify({ type: "blob.generate-client-token" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("should reject non-admin requests", async () => {
    vi.mocked(auth).mockResolvedValueOnce({
      user: { id: "user_1", role: "CUSTOMER" },
      expires: "12345",
    });

    const req = new NextRequest("http://localhost/api/upload", {
      method: "POST",
      body: JSON.stringify({ type: "blob.generate-client-token" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
