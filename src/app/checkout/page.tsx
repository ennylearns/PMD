"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Lock, MapPin, ShoppingBag, XCircle } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import {
  buildCheckoutPayload,
  CheckoutAddress,
  CheckoutContact,
  CheckoutPayload,
  validateCartStock,
  validateCheckoutDetails,
} from "@/lib/checkout";
import { formatNaira } from "@/lib/delivery";

type DeliveryCityData = {
  id: string;
  name: string;
  overrideFee: number | null;
};

type DeliveryStateData = {
  id: string;
  name: string;
  defaultFee: number;
  cities: DeliveryCityData[];
};

type SavedAddress = {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
  isDefault: boolean;
};

const EMPTY_CONTACT: CheckoutContact = {
  email: "",
  name: "",
  phone: "",
};

const EMPTY_ADDRESS: CheckoutAddress = {
  street: "",
  city: "",
  state: "",
  country: "NG",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, itemCount, cartTotal, isLoading } = useCart();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [contact, setContact] = useState<CheckoutContact>(EMPTY_CONTACT);
  const [address, setAddress] = useState<CheckoutAddress>(EMPTY_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(false);
  const [error, setError] = useState("");
  const [preparedPayload, setPreparedPayload] = useState<CheckoutPayload | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [deliveryStates, setDeliveryStates] = useState<DeliveryStateData[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const isAuthenticated = status === "authenticated";
  const sessionEmail = session?.user?.email ?? "";
  const sessionName = session?.user?.name ?? "";

  // Derive delivery data from the fetched states
  const stateNames = useMemo(() => deliveryStates.map((s) => s.name), [deliveryStates]);
  const selectedState = useMemo(
    () => deliveryStates.find((s) => s.name.toLowerCase() === address.state.toLowerCase()),
    [deliveryStates, address.state]
  );
  const cityOptions = useMemo(() => selectedState?.cities.map((c) => c.name) ?? [], [selectedState]);
  const deliveryFee = useMemo(() => {
    if (!selectedState) return 0;
    if (address.city) {
      const cityMatch = selectedState.cities.find(
        (c) => c.name.toLowerCase() === address.city.toLowerCase()
      );
      if (cityMatch?.overrideFee != null) return cityMatch.overrideFee;
    }
    return selectedState.defaultFee;
  }, [selectedState, address.city]);
  const isLocationSupported = useMemo(() => {
    if (!selectedState || !address.city) return false;
    return selectedState.cities.some(
      (c) => c.name.toLowerCase() === address.city.toLowerCase()
    );
  }, [selectedState, address.city]);

  const stockResult = useMemo(() => validateCartStock(items), [items]);
  const total = cartTotal - (appliedCoupon?.discountAmount || 0) + deliveryFee;
  const checkoutContact = useMemo(
    () => ({
      email: isAuthenticated ? sessionEmail : contact.email,
      name: isAuthenticated && sessionName ? sessionName : contact.name,
      phone: contact.phone,
    }),
    [contact.email, contact.name, contact.phone, isAuthenticated, sessionEmail, sessionName]
  );

  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.replace("/cart");
    }
  }, [isLoading, items.length, router]);

  // Fetch delivery states and cities from the database
  useEffect(() => {
    let isMounted = true;
    async function fetchDeliveryData() {
      try {
        const res = await fetch("/api/delivery-fees");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted) {
          setDeliveryStates(data.states ?? []);
        }
      } catch {
        // Silently fail — customer can still proceed if data loads later
      }
    }
    fetchDeliveryData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    async function fetchAddresses() {
      try {
        const res = await fetch("/api/addresses");
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted) return;
        const addresses = data.addresses ?? [];
        setSavedAddresses(addresses);

        const defaultSupportedAddress =
          addresses.find(
            (savedAddress: SavedAddress) => {
              const matchState = deliveryStates.find(
                (s) => s.name.toLowerCase() === savedAddress.state.toLowerCase()
              );
              if (!matchState) return false;
              return savedAddress.isDefault && matchState.cities.some(
                (c) => c.name.toLowerCase() === savedAddress.city.toLowerCase()
              );
            }
          ) ??
          addresses.find((savedAddress: SavedAddress) => {
            const matchState = deliveryStates.find(
              (s) => s.name.toLowerCase() === savedAddress.state.toLowerCase()
            );
            if (!matchState) return false;
            return matchState.cities.some(
              (c) => c.name.toLowerCase() === savedAddress.city.toLowerCase()
            );
          });

        if (defaultSupportedAddress) {
          setSelectedAddressId(defaultSupportedAddress.id);
          setAddress({
            street: defaultSupportedAddress.street,
            city: defaultSupportedAddress.city,
            state: defaultSupportedAddress.state,
            country: defaultSupportedAddress.country || "NG",
          });
        }
      } catch {
        if (isMounted) setError("Could not load saved addresses");
      }
    }

    fetchAddresses();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, deliveryStates]);

  function selectSavedAddress(savedAddress: SavedAddress) {
    setSelectedAddressId(savedAddress.id);
    setAddress({
      street: savedAddress.street,
      city: savedAddress.city,
      state: savedAddress.state,
      country: savedAddress.country || "NG",
    });
    setSaveAddress(false);
    setPreparedPayload(null);
    setError("");
  }

  function useOneOffAddress() {
    setSelectedAddressId(null);
    setAddress(EMPTY_ADDRESS);
    setPreparedPayload(null);
    setError("");
  }

  async function saveOneOffAddress() {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        street: address.street,
        city: address.city,
        state: address.state,
        isDefault: savedAddresses.length === 0,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save address");
    }

    const data = await res.json();
    setSavedAddresses((current) => [data.address, ...current]);
    setSelectedAddressId(data.address.id);
  }

  async function handleApplyCoupon() {
    setCouponError("");
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const res = await fetch("/api/checkout/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal: cartTotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon");
        setAppliedCoupon(null);
      } else if (data.valid) {
        setAppliedCoupon({ code: couponCode.trim(), discountAmount: data.discountAmount });
        setCouponCode("");
      }
    } catch (err) {
      setCouponError("Failed to apply coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  async function handlePreparePayment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPreparedPayload(null);

    const detailResult = validateCheckoutDetails({ contact: checkoutContact, address });
    if (!detailResult.valid) {
      setError(detailResult.errors[0]);
      return;
    }

    if (!stockResult.valid) {
      setError(stockResult.errors[0]);
      return;
    }

    if (!deliveryFee) {
      setError("Select a supported delivery city");
      return;
    }

    setIsPreparing(true);
    try {
      if (isAuthenticated && saveAddress && !selectedAddressId) {
        await saveOneOffAddress();
      }

      const payload = buildCheckoutPayload({
        contact: checkoutContact,
        address,
        cartItems: items,
        deliveryFee,
        saveAddress: isAuthenticated && saveAddress && !selectedAddressId,
        couponCode: appliedCoupon?.code || null,
      });

      setPreparedPayload(payload);

      // Initialize payment and redirect to Paystack checkout
      const res = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Payment initialization failed. Please try again.");
        return;
      }

      // Hard redirect to Paystack — browser leaves the page
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsPreparing(false);
    }
  }

  if (isLoading || (!isLoading && items.length === 0)) {
    return (
      <main className="min-h-screen flex items-center justify-center px-(--spacing-margin-mobile)">
        <div className="flex items-center gap-3 text-on-surface-variant font-accent-label text-xs uppercase tracking-[0.2em]">
          <div className="w-5 h-5 border-2 border-on-surface-variant/30 border-t-error rounded-full animate-spin" />
          Loading checkout
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-surface-container-highest bg-surface-container-lowest/95 backdrop-blur px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-error italic tracking-normal"
          >
            PMD
          </Link>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Lock className="w-4 h-4" />
            <span className="font-accent-label text-xs uppercase tracking-[0.18em]">
              Secure checkout
            </span>
          </div>
        </div>
      </header>

      <form
        onSubmit={handlePreparePayment}
        className="max-w-7xl mx-auto px-(--spacing-margin-mobile) md:px-(--spacing-margin-desktop) py-10 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8"
      >
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-6">
            <div className="border-b border-surface-container-highest pb-4">
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background uppercase tracking-normal">
                Delivery Info
              </h1>
            </div>

            {isAuthenticated && savedAddresses.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.18em]">
                  Saved addresses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedAddresses.map((savedAddress) => {
                     const supported = (() => {
                      const matchState = deliveryStates.find(
                        (s) => s.name.toLowerCase() === savedAddress.state.toLowerCase()
                      );
                      if (!matchState) return false;
                      return matchState.cities.some(
                        (c) => c.name.toLowerCase() === savedAddress.city.toLowerCase()
                      );
                    })();
                    const selected = selectedAddressId === savedAddress.id;

                    return (
                      <button
                        type="button"
                        key={savedAddress.id}
                        disabled={!supported}
                        onClick={() => selectSavedAddress(savedAddress)}
                        className={`text-left border p-4 transition-colors duration-200 ${
                          selected
                            ? "border-error bg-error/10"
                            : "border-surface-container-highest bg-surface-container-low hover:border-outline"
                        } ${!supported ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-1 text-on-surface-variant" />
                          <div>
                            <p className="font-body-md text-sm text-on-surface">
                              {savedAddress.street}
                            </p>
                            <p className="font-body-sm text-sm text-on-surface-variant">
                              {savedAddress.city}, {savedAddress.state}
                            </p>
                            <p className="mt-2 font-accent-label text-[10px] uppercase tracking-[0.16em] text-error">
                              {supported ? (savedAddress.isDefault ? "Default" : "") : "Unavailable"}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={useOneOffAddress}
                  className="font-accent-label text-xs uppercase tracking-[0.18em] text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Use a different address
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={checkoutContact.email}
                  readOnly={isAuthenticated}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full bg-surface border border-surface-container-highest p-4 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors read-only:opacity-70"
                />
              </label>

              <label className="space-y-2">
                <span className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                  Name
                </span>
                <input
                  type="text"
                  required
                  value={checkoutContact.name}
                  readOnly={isAuthenticated && Boolean(sessionName)}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="w-full bg-surface border border-surface-container-highest p-4 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors read-only:opacity-70"
                />
              </label>
            </div>

            <label className="space-y-2 block">
              <span className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                Phone
              </span>
              <input
                type="tel"
                required
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="w-full bg-surface border border-surface-container-highest p-4 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors"
              />
            </label>

            <label className="space-y-2 block">
              <span className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                Street address
              </span>
              <input
                type="text"
                required
                value={address.street}
                onChange={(e) => {
                  setSelectedAddressId(null);
                  setAddress({ ...address, street: e.target.value });
                }}
                className="w-full bg-surface border border-surface-container-highest p-4 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="space-y-2">
                <span className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                  State
                </span>
                <select
                  required
                  value={address.state}
                  onChange={(e) => {
                    setSelectedAddressId(null);
                    setAddress({ ...address, state: e.target.value, city: "" });
                  }}
                  className="w-full bg-surface border border-surface-container-highest p-4 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors appearance-none"
                >
                  <option value="">Select state</option>
                  {stateNames.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                  City
                </span>
                <select
                  required
                  value={address.city}
                  disabled={!address.state}
                  onChange={(e) => {
                    setSelectedAddressId(null);
                    setAddress({ ...address, city: e.target.value });
                  }}
                  className="w-full bg-surface border border-surface-container-highest p-4 text-on-surface font-body-md text-sm outline-none focus:border-error transition-colors appearance-none disabled:opacity-50"
                >
                  <option value="">
                    {address.state ? "Select city" : "Select state first"}
                  </option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
            </div>

            {isAuthenticated && !selectedAddressId && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="w-4 h-4 accent-error"
                />
                <span className="font-accent-label text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                  Save this address
                </span>
              </label>
            )}

            {error && (
              <div className="border border-error/40 bg-error-container/20 p-4 text-error font-body-sm text-sm">
                {error}
              </div>
            )}



          </section>
        </div>

        <aside className="lg:col-span-5">
          <div className="sticky top-28 bg-[#1A1A1A] border border-surface-container-highest p-6 md:p-8">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface uppercase mb-6 border-b border-surface-container-highest pb-4">
              Order Summary
            </h2>

            <div className="space-y-5 pb-6 border-b border-surface-container-highest">
              {items.map((item) => {
                const product = item.variant.product;
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-20 h-24 bg-surface-container shrink-0 overflow-hidden">
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-headline-lg text-sm text-on-surface uppercase tracking-normal">
                        {product.name}
                      </p>
                      <p className="mt-1 font-body-sm text-sm text-on-surface-variant">
                        Size: {item.variant.size} | Color: {item.variant.color}
                      </p>
                      <div className="mt-4 flex justify-between font-accent-label text-xs uppercase tracking-[0.14em] text-on-surface">
                        <span>Qty: {item.quantity}</span>
                        <span>{formatNaira(product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 py-6 border-b border-surface-container-highest">
              <div className="flex justify-between font-accent-label text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                <span>Subtotal ({itemCount} items)</span>
                <span className="text-on-surface">{formatNaira(cartTotal)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between font-accent-label text-xs uppercase tracking-[0.16em] text-error">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-{formatNaira(appliedCoupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between font-accent-label text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                <span>Delivery Fee</span>
                <span className="text-on-surface">
                  {address.state ? formatNaira(deliveryFee) : "Select state"}
                </span>
              </div>
              {!stockResult.valid && (
                <p className="font-body-sm text-sm text-error">{stockResult.errors[0]}</p>
              )}
            </div>

            <div className="py-6 border-b border-surface-container-highest space-y-3">
              <label className="font-accent-label text-xs text-on-surface-variant uppercase tracking-[0.16em]">
                Gift card or discount code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-surface-container-low border border-surface-container-highest p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-on-surface">{appliedCoupon.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-error hover:text-error/80 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 bg-surface border border-surface-container-highest p-3 text-on-surface font-mono text-sm outline-none focus:border-on-surface transition-colors uppercase placeholder:normal-case"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || isApplyingCoupon}
                    className="bg-on-background text-background px-6 font-accent-label text-xs uppercase tracking-[0.16em] disabled:opacity-50 hover:bg-on-background/90 transition-colors"
                  >
                    {isApplyingCoupon ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="font-body-sm text-xs text-error">{couponError}</p>}
            </div>

            <div className="flex justify-between py-6">
              <span className="font-headline-lg text-base text-error uppercase tracking-normal">
                Total
              </span>
              <span className="font-headline-lg text-xl text-error">
                {formatNaira(total)}
              </span>
            </div>

            <button
              type="submit"
              disabled={isPreparing || !stockResult.valid}
              className="w-full py-4 px-6 bg-[#f5f5f5] text-[#131313] text-sm font-button-text uppercase tracking-[0.2em] flex items-center justify-between hover:bg-error hover:text-on-error transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPreparing ? "Preparing..." : "Proceed to Payment"}
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="mt-6 text-center font-body-sm text-sm text-on-surface-variant/60">
              Paystack protected payment
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}
