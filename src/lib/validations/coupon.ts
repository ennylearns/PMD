import { z } from "zod";
import { DiscountType } from "@prisma/client";

export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code is too long"),
  description: z.string().optional().nullable(),
  discountType: z.nativeEnum(DiscountType),
  discountAmount: z.number().positive("Discount amount must be positive"),
  minPurchase: z.number().nonnegative("Minimum purchase cannot be negative").optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  usageLimit: z.number().int().positive("Usage limit must be positive").optional().nullable(),
  isActive: z.boolean().default(true),
}).refine((data) => {
  if (data.endDate && data.endDate <= data.startDate) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.discountType === "PERCENTAGE" && data.discountAmount > 100) {
    return false;
  }
  return true;
}, {
  message: "Percentage discount cannot exceed 100%",
  path: ["discountAmount"],
});

export type CouponFormData = z.infer<typeof couponSchema>;
