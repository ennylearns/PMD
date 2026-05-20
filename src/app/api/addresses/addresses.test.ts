import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

import { GET, POST } from "@/app/api/addresses/route";
import { PUT, DELETE } from "@/app/api/addresses/[id]/route";

// --- Mock auth at the system boundary ---
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}));

const mockPrisma = prisma as unknown as {
  address: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

// --- Helpers ---

function createRequest(
  url: string,
  options?: { method?: string; body?: Record<string, unknown> }
) {
  const init: RequestInit = { method: options?.method || "GET" };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
    init.headers = { "Content-Type": "application/json" };
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

function routeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

// --- Fixtures ---

const USER_ID = "user-1";
const AUTH_SESSION = {
  user: { id: USER_ID, name: "Ade", email: "ade@example.com", role: "CUSTOMER" },
};

const MOCK_ADDRESS = {
  id: "addr-1",
  userId: USER_ID,
  street: "12 Broad Street",
  city: "Lagos",
  state: "Lagos",
  country: "NG",
  zipCode: null,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_ADDRESS_2 = {
  ...MOCK_ADDRESS,
  id: "addr-2",
  street: "5 Herbert Macaulay Way",
  city: "Yaba",
  isDefault: false,
};

// --- Tests ---

describe("Address API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockAuth.mockResolvedValue(AUTH_SESSION);
    // Default: $transaction passes through
    mockPrisma.$transaction.mockImplementation(
      async (fn: (tx: unknown) => Promise<unknown>) => fn(mockPrisma)
    );
  });

  // --- Unauthenticated access ---

  describe("authentication", () => {
    it("rejects unauthenticated GET requests", async () => {
      mockAuth.mockResolvedValue(null);

      const request = createRequest("http://localhost:3000/api/addresses");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it("rejects unauthenticated POST requests", async () => {
      mockAuth.mockResolvedValue(null);

      const request = createRequest("http://localhost:3000/api/addresses", {
        method: "POST",
        body: { street: "test", city: "test", state: "test" },
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  // --- GET /api/addresses ---

  describe("GET /api/addresses", () => {
    it("returns all addresses for authenticated user", async () => {
      mockPrisma.address.findMany.mockResolvedValue([MOCK_ADDRESS, MOCK_ADDRESS_2]);

      const request = createRequest("http://localhost:3000/api/addresses");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.addresses).toHaveLength(2);
    });
  });

  // --- POST /api/addresses ---

  describe("POST /api/addresses", () => {
    it("creates a new address", async () => {
      mockPrisma.address.create.mockResolvedValue(MOCK_ADDRESS);
      mockPrisma.address.updateMany.mockResolvedValue({ count: 0 });

      const request = createRequest("http://localhost:3000/api/addresses", {
        method: "POST",
        body: {
          street: "12 Broad Street",
          city: "Lagos",
          state: "Lagos",
          isDefault: true,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.address.street).toBe("12 Broad Street");
      expect(data.address.country).toBe("NG");
    });

    it("rejects missing required fields", async () => {
      const request = createRequest("http://localhost:3000/api/addresses", {
        method: "POST",
        body: { street: "12 Broad Street" },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("un-defaults other addresses when setting new default", async () => {
      mockPrisma.address.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.address.create.mockResolvedValue(MOCK_ADDRESS);

      const request = createRequest("http://localhost:3000/api/addresses", {
        method: "POST",
        body: {
          street: "12 Broad Street",
          city: "Lagos",
          state: "Lagos",
          isDefault: true,
        },
      });

      await POST(request);

      // Should un-default existing addresses first
      expect(mockPrisma.address.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: USER_ID, isDefault: true },
          data: { isDefault: false },
        })
      );
    });
  });

  // --- PUT /api/addresses/[id] ---

  describe("PUT /api/addresses/[id]", () => {
    it("updates an existing address", async () => {
      mockPrisma.address.findFirst.mockResolvedValue(MOCK_ADDRESS);
      mockPrisma.address.update.mockResolvedValue({
        ...MOCK_ADDRESS,
        street: "15 New Street",
      });
      mockPrisma.address.updateMany.mockResolvedValue({ count: 0 });

      const request = createRequest(
        "http://localhost:3000/api/addresses/addr-1",
        {
          method: "PUT",
          body: { street: "15 New Street" },
        }
      );

      const response = await PUT(request, routeParams("addr-1"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.address.street).toBe("15 New Street");
    });

    it("returns 404 for non-existent address", async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const request = createRequest(
        "http://localhost:3000/api/addresses/fake-id",
        {
          method: "PUT",
          body: { street: "15 New Street" },
        }
      );

      const response = await PUT(request, routeParams("fake-id"));

      expect(response.status).toBe(404);
    });
  });

  // --- DELETE /api/addresses/[id] ---

  describe("DELETE /api/addresses/[id]", () => {
    it("deletes an address", async () => {
      mockPrisma.address.findFirst.mockResolvedValue(MOCK_ADDRESS);
      mockPrisma.address.delete.mockResolvedValue(MOCK_ADDRESS);

      const request = createRequest(
        "http://localhost:3000/api/addresses/addr-1",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("addr-1"));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBeDefined();
    });

    it("returns 404 for non-existent address", async () => {
      mockPrisma.address.findFirst.mockResolvedValue(null);

      const request = createRequest(
        "http://localhost:3000/api/addresses/fake-id",
        { method: "DELETE" }
      );

      const response = await DELETE(request, routeParams("fake-id"));

      expect(response.status).toBe(404);
    });
  });
});
