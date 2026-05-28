import { DiscountType, Coupon } from "@prisma/client";

export type CouponValidationResult = {
  valid: boolean;
  discountAmount: number;
  error?: string;
};

export function validateAndCalculateDiscount(
  coupon: Coupon,
  subtotal: number
): CouponValidationResult {
  if (!coupon.isActive) {
    return { valid: false, discountAmount: 0, error: "Coupon is inactive" };
  }

  const now = new Date();
  
  if (coupon.startDate && now < coupon.startDate) {
    return { valid: false, discountAmount: 0, error: "Coupon is not yet active" };
  }

  if (coupon.endDate && now > coupon.endDate) {
    return { valid: false, discountAmount: 0, error: "Coupon has expired" };
  }

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, error: "Coupon usage limit reached" };
  }

  if (coupon.minPurchase !== null && subtotal < coupon.minPurchase) {
    return { valid: false, discountAmount: 0, error: "Minimum purchase amount not met" };
  }

  let discountAmount = 0;

  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = subtotal * (coupon.discountAmount / 100);
  } else if (coupon.discountType === "FIXED") {
    discountAmount = coupon.discountAmount;
  }

  // Cap at subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    valid: true,
    discountAmount,
  };
}
