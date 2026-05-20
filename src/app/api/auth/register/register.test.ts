import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Import will fail until we implement the route — that's RED phase
import { POST } from "@/app/api/auth/register/route";

// --- Mock next/headers cookies for guest ID ---
const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}));

// --- Mock bcryptjs at the system boundary ---
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn(),
  },
}));

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  cartItem: {
    updateMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

// --- Helpers ---

function createRequest(body: Record<string, unknown>) {
  return new NextRequest(new URL("http://localhost:3000/api/auth/register"), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// --- Fixtures ---

const MOCK_USER = {
  id: "user-1",
  name: "Ade Johnson",
  email: "ade@example.com",
  password: "hashed_SecurePass123!",
  role: "CUSTOMER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const GUEST_ID = "guest-abc-123";

// --- Tests ---

describe("Registration API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no guest cookie
    mockCookieStore.get.mockReturnValue(undefined);
    // Default: $transaction passes callback through to mockPrisma
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)
    );
  });

  it("registers a new user with name, email, and password", async () => {
    // No existing user with this email
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(MOCK_USER);

    const request = createRequest({
      name: "Ade Johnson",
      email: "ade@example.com",
      password: "SecurePass123!",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.user.email).toBe("ade@example.com");
    expect(data.user.name).toBe("Ade Johnson");
  });

  it("never exposes the password in the response", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(MOCK_USER);

    const request = createRequest({
      name: "Ade Johnson",
      email: "ade@example.com",
      password: "SecurePass123!",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.user.password).toBeUndefined();
  });

  it("rejects duplicate email addresses", async () => {
    // Email already exists
    mockPrisma.user.findUnique.mockResolvedValue(MOCK_USER);

    const request = createRequest({
      name: "Another User",
      email: "ade@example.com",
      password: "AnotherPass123!",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });

  it("rejects missing required fields", async () => {
    const request = createRequest({
      email: "ade@example.com",
      // missing name and password
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const request = createRequest({
      name: "Ade",
      email: "ade@example.com",
      password: "short",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain("password");
  });

  it("merges guest cart items to user on registration", async () => {
    // Guest has a cart
    mockCookieStore.get.mockReturnValue({ value: GUEST_ID });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue(MOCK_USER);
    mockPrisma.cartItem.updateMany.mockResolvedValue({ count: 2 });
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
      return fn(mockPrisma);
    });

    const request = createRequest({
      name: "Ade Johnson",
      email: "ade@example.com",
      password: "SecurePass123!",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    // Cart items should have been transferred
    expect(mockPrisma.cartItem.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { guestId: GUEST_ID },
        data: expect.objectContaining({ userId: MOCK_USER.id, guestId: null }),
      })
    );
  });
});
