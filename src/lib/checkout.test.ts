import { describe, expect, it } from "vitest";
import {
  buildCheckoutPayload,
  validateCartStock,
  validateCheckoutDetails,
} from "./checkout";

const cartItem = {
  id: "cart-item-1",
  variantId: "variant-1",
  quantity: 2,
  variant: {
    inventory: { stock: 5 },
    product: {
      price: 15000,
    },
  },
};

describe("Checkout helpers", () => {
  it("requires Delivery Contact and Address fields", () => {
    const result = validateCheckoutDetails({
      contact: { email: "", name: "", phone: "" },
      address: { street: "", city: "", state: "" },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "Email is required",
        "Name is required",
        "Phone is required",
        "Street address is required",
        "State is required",
        "City is required",
      ])
    );
  });

  it("rejects unsupported delivery locations", () => {
    const result = validateCheckoutDetails({
      contact: { email: "ade@example.com", name: "Ade", phone: "08012345678" },
      address: { street: "12 Broad Street", city: "Yaba", state: "Plateau" },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Select a supported delivery city");
  });

  it("accepts valid checkout details", () => {
    const result = validateCheckoutDetails({
      contact: { email: "ade@example.com", name: "Ade", phone: "08012345678" },
      address: { street: "12 Broad Street", city: "Yaba", state: "Lagos" },
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("blocks checkout when cart quantity exceeds current stock", () => {
    const result = validateCartStock([
      {
        ...cartItem,
        quantity: 6,
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain("Only 5 in stock");
  });

  it("builds the Paystack initialization payload prepared by checkout", () => {
    const payload = buildCheckoutPayload({
      contact: { email: "ade@example.com", name: "Ade", phone: "08012345678" },
      address: { street: "12 Broad Street", city: "Yaba", state: "Lagos" },
      cartItems: [cartItem],
      deliveryFee: 5000,
      saveAddress: true,
    });

    expect(payload).toEqual({
      contact: { email: "ade@example.com", name: "Ade", phone: "08012345678" },
      address: {
        street: "12 Broad Street",
        city: "Yaba",
        state: "Lagos",
        country: "NG",
      },
      items: [
        {
          cartItemId: "cart-item-1",
          variantId: "variant-1",
          quantity: 2,
          unitPrice: 15000,
        },
      ],
      subtotal: 30000,
      deliveryFee: 5000,
      total: 35000,
      saveAddress: true,
    });
  });
});
