import { describe, expect, it } from "vitest";
import {
  formatNaira,
  getDeliveryFee,
  getSupportedCities,
  isSupportedDeliveryLocation,
} from "./delivery";

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
