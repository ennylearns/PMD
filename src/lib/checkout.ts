import { isSupportedDeliveryLocation } from "./delivery";

export type CheckoutContact = {
  email: string;
  name: string;
  phone: string;
};

export type CheckoutAddress = {
  street: string;
  city: string;
  state: string;
  country?: string;
};

export type CheckoutCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    inventory: { stock: number } | null;
    product: {
      price: number;
    };
  };
};

export type CheckoutPayload = {
  contact: CheckoutContact;
  address: Required<CheckoutAddress>;
  items: Array<{
    cartItemId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  saveAddress: boolean;
};

function hasValue(value: string) {
  return value.trim().length > 0;
}

export function validateCheckoutDetails({
  contact,
  address,
}: {
  contact: CheckoutContact;
  address: CheckoutAddress;
}) {
  const errors: string[] = [];

  if (!hasValue(contact.email)) errors.push("Email is required");
  if (!hasValue(contact.name)) errors.push("Name is required");
  if (!hasValue(contact.phone)) errors.push("Phone is required");
  if (!hasValue(address.street)) errors.push("Street address is required");
  if (!hasValue(address.state)) errors.push("State is required");
  if (!hasValue(address.city)) errors.push("City is required");

  if (
    hasValue(address.state) &&
    hasValue(address.city) &&
    !isSupportedDeliveryLocation(address.state, address.city)
  ) {
    errors.push("Select a supported delivery city");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateCartStock(items: CheckoutCartItem[]) {
  const errors = items.flatMap((item) => {
    const stock = item.variant.inventory?.stock ?? 0;
    if (item.quantity > stock) {
      return [`Only ${stock} in stock for ${item.variantId}`];
    }
    if (item.quantity < 1) {
      return [`Quantity must be at least 1 for ${item.variantId}`];
    }
    return [];
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function buildCheckoutPayload({
  contact,
  address,
  cartItems,
  deliveryFee,
  saveAddress,
}: {
  contact: CheckoutContact;
  address: CheckoutAddress;
  cartItems: CheckoutCartItem[];
  deliveryFee: number;
  saveAddress: boolean;
}): CheckoutPayload {
  const items = cartItems.map((item) => ({
    cartItemId: item.id,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: item.variant.product.price,
  }));
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    contact: {
      email: contact.email.trim(),
      name: contact.name.trim(),
      phone: contact.phone.trim(),
    },
    address: {
      street: address.street.trim(),
      city: address.city.trim(),
      state: address.state.trim(),
      country: address.country?.trim() || "NG",
    },
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    saveAddress,
  };
}
