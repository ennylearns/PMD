import { describe, expect, it, vi, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// Mock next-auth to simulate admin session for protected routes
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

const mockPrisma = prisma as unknown as {
  deliveryState: {
    findMany: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  deliveryCity: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

describe("Delivery fees API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("GET /api/delivery-fees returns all states with their cities", async () => {
    const mockStates = [
      {
        id: "state-1",
        name: "Plateau",
        defaultFee: 2000,
        cities: [{ id: "city-1", name: "Jos", overrideFee: null }],
      },
      {
        id: "state-2",
        name: "Lagos",
        defaultFee: 5000,
        cities: [
          { id: "city-2", name: "Lagos", overrideFee: null },
          { id: "city-3", name: "Lekki", overrideFee: 7500 },
        ],
      },
    ];
    mockPrisma.deliveryState.findMany.mockResolvedValue(mockStates);

    const { GET } = await import("./route");
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.states).toHaveLength(2);
    expect(data.states[0].name).toBe("Plateau");
    expect(data.states[1].cities).toHaveLength(2);
  });

  it("PATCH /api/delivery-fees/states/:id updates a state default fee", async () => {
    mockPrisma.deliveryState.findUnique.mockResolvedValue({
      id: "state-1",
      name: "Plateau",
      defaultFee: 2000,
    });
    mockPrisma.deliveryState.update.mockResolvedValue({
      id: "state-1",
      name: "Plateau",
      defaultFee: 2500,
    });

    const { PATCH } = await import("./states/[id]/route");
    const request = new NextRequest("http://localhost/api/delivery-fees/states/state-1", {
      method: "PATCH",
      body: JSON.stringify({ defaultFee: 2500 }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "state-1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.state.defaultFee).toBe(2500);
  });

  it("PATCH /api/delivery-fees/states/:id rejects negative fees", async () => {
    const { PATCH } = await import("./states/[id]/route");
    const request = new NextRequest("http://localhost/api/delivery-fees/states/state-1", {
      method: "PATCH",
      body: JSON.stringify({ defaultFee: -100 }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "state-1" }) });
    expect(response.status).toBe(400);
  });

  it("PATCH /api/delivery-fees/cities/:id updates a city override fee", async () => {
    mockPrisma.deliveryCity.findUnique.mockResolvedValue({
      id: "city-1",
      name: "Lekki",
      overrideFee: null,
    });
    mockPrisma.deliveryCity.update.mockResolvedValue({
      id: "city-1",
      name: "Lekki",
      overrideFee: 7500,
    });

    const { PATCH } = await import("./cities/[id]/route");
    const request = new NextRequest("http://localhost/api/delivery-fees/cities/city-1", {
      method: "PATCH",
      body: JSON.stringify({ overrideFee: 7500 }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "city-1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.city.overrideFee).toBe(7500);
  });

  it("PATCH /api/delivery-fees/cities/:id accepts null to clear override", async () => {
    mockPrisma.deliveryCity.findUnique.mockResolvedValue({
      id: "city-1",
      name: "Lekki",
      overrideFee: 7500,
    });
    mockPrisma.deliveryCity.update.mockResolvedValue({
      id: "city-1",
      name: "Lekki",
      overrideFee: null,
    });

    const { PATCH } = await import("./cities/[id]/route");
    const request = new NextRequest("http://localhost/api/delivery-fees/cities/city-1", {
      method: "PATCH",
      body: JSON.stringify({ overrideFee: null }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "city-1" }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.city.overrideFee).toBeNull();
  });
});

