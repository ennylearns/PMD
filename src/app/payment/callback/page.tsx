"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

type VerifyResult =
  | { status: "success"; orderId: string }
  | { status: "failed"; message: string }
  | { status: "loading" };

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<VerifyResult>({ status: "loading" });

  useEffect(() => {
    const reference = searchParams.get("reference") ?? searchParams.get("trxref");

    if (!reference) {
      setResult({ status: "failed", message: "No payment reference found." });
      return;
    }

    async function lookupOrder() {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();

        if (res.ok && data.orderId) {
          router.replace(`/order/${data.orderId}`);
        } else {
          setResult({ status: "failed", message: data.error ?? "Payment could not be confirmed." });
        }
      } catch {
        setResult({ status: "failed", message: "Network error. Please check your order history." });
      }
    }

    const timer = setTimeout(lookupOrder, 2000);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  if (result.status === "loading") {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-10 h-10 border-2 border-on-surface-variant/20 border-t-error rounded-full animate-spin" />
        <p className="font-accent-label text-xs uppercase tracking-[0.2em] text-on-surface-variant">
          Confirming your payment…
        </p>
      </main>
    );
  }

  if (result.status === "failed") {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6 text-center">
        <XCircle className="w-16 h-16 text-error" strokeWidth={1} />
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background uppercase">
          Payment not confirmed
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-sm">
          {result.message}
        </p>
        <div className="flex gap-4 mt-2">
          <Link
            href="/checkout"
            className="px-6 py-3 border border-outline text-on-surface font-accent-label text-xs uppercase tracking-[0.18em] hover:border-error hover:text-error transition-colors"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-error text-on-error font-accent-label text-xs uppercase tracking-[0.18em] hover:bg-error/80 transition-colors"
          >
            Go home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <CheckCircle className="w-12 h-12 text-error" strokeWidth={1} />
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex flex-col items-center justify-center"><div className="w-10 h-10 border-2 border-on-surface-variant/20 border-t-error rounded-full animate-spin" /></div>}>
      <CallbackContent />
    </Suspense>
  );
}
