import { describe, it, expect } from "vitest";
import { validateAndCalculateDiscount } from "./coupon";

describe("validateAndCalculateDiscount", () => {
  it("calculates percentage discount correctly", () => {
    const coupon = {
      discountType: "PERCENTAGE",
      discountAmount: 10, // 10%
      minPurchase: null,
      startDate: new Date(Date.now() - 100000), // Past
      endDate: null,
      usageLimit: null,
      usageCount: 0,
      isActive: true,
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(500); // 10% of 5000
    expect(result.error).toBeUndefined();
  });

  it("calculates fixed discount and caps at subtotal", () => {
    const coupon = {
      discountType: "FIXED",
      discountAmount: 6000,
      minPurchase: null,
      startDate: new Date(Date.now() - 100000),
      endDate: null,
      usageLimit: null,
      usageCount: 0,
      isActive: true,
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(true);
    expect(result.discountAmount).toBe(5000); // Capped at subtotal
    expect(result.error).toBeUndefined();
  });

  it("rejects if coupon is inactive", () => {
    const coupon = {
      discountType: "PERCENTAGE",
      discountAmount: 10,
      isActive: false,
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(false);
    expect(result.discountAmount).toBe(0);
    expect(result.error).toBe("Coupon is inactive");
  });

  it("rejects if coupon has not started yet", () => {
    const coupon = {
      discountType: "PERCENTAGE",
      discountAmount: 10,
      isActive: true,
      startDate: new Date(Date.now() + 100000), // Future
      endDate: null,
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Coupon is not yet active");
  });

  it("rejects if coupon has expired", () => {
    const coupon = {
      discountType: "PERCENTAGE",
      discountAmount: 10,
      isActive: true,
      startDate: new Date(Date.now() - 200000),
      endDate: new Date(Date.now() - 100000), // Past
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Coupon has expired");
  });

  it("rejects if usage limit is reached", () => {
    const coupon = {
      discountType: "PERCENTAGE",
      discountAmount: 10,
      isActive: true,
      usageLimit: 50,
      usageCount: 50,
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Coupon usage limit reached");
  });

  it("rejects if subtotal is below minimum purchase", () => {
    const coupon = {
      discountType: "FIXED",
      discountAmount: 5000,
      isActive: true,
      minPurchase: 10000,
    } as any;

    const result = validateAndCalculateDiscount(coupon, 5000);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Minimum purchase amount not met");
  });
});
