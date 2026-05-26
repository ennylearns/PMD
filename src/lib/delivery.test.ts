import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  formatNaira,
  getDeliveryFee,
  getSupportedCities,
  isSupportedDeliveryLocation,
} from "./delivery";
import {
  lookupDeliveryFee,
  getDeliveryStates,
  getDeliveryCities,
} from "./delivery-db";
import { prisma } from "./prisma";

const mockPrisma = prisma as unknown as {
  deliveryState: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  deliveryCity: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("Delivery helpers", () => {
  it("formats prices in naira without decimal places", () => {
    expect(formatNaira(2000)).toBe("\u20a62,000");
    expect(formatNaira(6500)).toBe("\u20a66,500");
  });

  it("looks up the default PMD delivery fee bands from Jos", () => {
    expect(getDeliveryFee({ state: "Plateau" })).toBe(2000);
    expect(getDeliveryFee({ state: "Benue" })).toBe(3500);
    expect(getDeliveryFee({ state: "FCT" })).toBe(3500);
    expect(getDeliveryFee({ state: "Lagos" })).toBe(5000);
    expect(getDeliveryFee({ state: "Rivers" })).toBe(5000);
    expect(getDeliveryFee({ state: "Abia" })).toBe(6500);
  });

  it("returns null when delivery state is unsupported", () => {
    expect(getDeliveryFee({ state: "Atlantis" })).toBeNull();
  });

  it("validates PMD-supported State and City combinations", () => {
    expect(isSupportedDeliveryLocation("Plateau", "Jos")).toBe(true);
    expect(isSupportedDeliveryLocation("Lagos", "Yaba")).toBe(true);
    expect(isSupportedDeliveryLocation("FCT", "Abuja")).toBe(true);
    expect(isSupportedDeliveryLocation("Plateau", "Yaba")).toBe(false);
    expect(isSupportedDeliveryLocation("Atlantis", "Jos")).toBe(false);
  });

  it("returns supported cities for the selected state", () => {
    expect(getSupportedCities("Lagos")).toEqual(
      expect.arrayContaining(["Lagos", "Ikeja", "Lekki", "Victoria Island", "Yaba"])
    );
    expect(getSupportedCities("Unknown")).toEqual([]);
  });
});

describe("DB-backed delivery fee lookup", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the state default fee when no city override exists", async () => {
    mockPrisma.deliveryState.findFirst.mockResolvedValue({
      id: "state-1",
      name: "Plateau",
      defaultFee: 2000,
    });
    mockPrisma.deliveryCity.findFirst.mockResolvedValue({
      id: "city-1",
      name: "Jos",
      deliveryStateId: "state-1",
      overrideFee: null,
    });

    const fee = await lookupDeliveryFee({ state: "Plateau", city: "Jos" });
    expect(fee).toBe(2000);
  });

  it("returns the city override fee when one exists", async () => {
    mockPrisma.deliveryState.findFirst.mockResolvedValue({
      id: "state-lagos",
      name: "Lagos",
      defaultFee: 5000,
    });
    mockPrisma.deliveryCity.findFirst.mockResolvedValue({
      id: "city-lekki",
      name: "Lekki",
      deliveryStateId: "state-lagos",
      overrideFee: 7500,
    });

    const fee = await lookupDeliveryFee({ state: "Lagos", city: "Lekki" });
    expect(fee).toBe(7500);
  });

  it("returns null for an unknown state", async () => {
    mockPrisma.deliveryState.findFirst.mockResolvedValue(null);

    const fee = await lookupDeliveryFee({ state: "Atlantis", city: "Nowhere" });
    expect(fee).toBeNull();
  });

  it("returns all delivery states with their cities", async () => {
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

    const states = await getDeliveryStates();
    expect(states).toHaveLength(2);
    expect(states[0].name).toBe("Plateau");
    expect(states[1].cities).toHaveLength(2);
  });

  it("returns cities for a given state from the DB", async () => {
    const mockCities = [
      { id: "city-1", name: "Lagos", overrideFee: null },
      { id: "city-2", name: "Ikeja", overrideFee: 5500 },
    ];
    mockPrisma.deliveryState.findFirst.mockResolvedValue({
      id: "state-lagos",
      name: "Lagos",
      defaultFee: 5000,
    });
    mockPrisma.deliveryCity.findMany.mockResolvedValue(mockCities);

    const cities = await getDeliveryCities("Lagos");
    expect(cities).toHaveLength(2);
    expect(cities[0].name).toBe("Lagos");
    expect(cities[1].overrideFee).toBe(5500);
  });
});
