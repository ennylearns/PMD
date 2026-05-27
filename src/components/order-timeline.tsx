import React from "react";
import { ORDER_STATUS_CONFIG } from "./order-status-badge";
import { CheckCircle, Clock } from "lucide-react";

export function OrderTimeline({ currentStatus }: { currentStatus: string }) {
  const currentStep = ORDER_STATUS_CONFIG[currentStatus]?.step ?? 0;
  const isCancelled = currentStatus === "CANCELLED";

  // The main linear progression steps for fulfillment
  const timelineSteps = ["PAID", "SHIPPED", "DELIVERED"];

  if (isCancelled) {
    return (
      <div className="bg-surface-container border border-error/20 p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-headline-lg text-error uppercase">Order Cancelled</h3>
          <p className="font-body-sm text-on-surface-variant mt-1">
            This order has been cancelled and will not be fulfilled.
          </p>
        </div>
      </div>
    );
  }

  if (currentStep === 0) {
    return (
      <div className="bg-surface-container border border-surface-container-highest p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-headline-lg text-yellow-400 uppercase">Awaiting Payment</h3>
          <p className="font-body-sm text-on-surface-variant mt-1">
            Please complete your payment to begin the fulfillment process.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-surface-container-highest p-6 md:p-8">
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-6 left-6 right-6 h-[2px] bg-surface-container-highest hidden md:block" />

        {/* Progress line */}
        <div
          className="absolute top-6 left-6 h-[2px] bg-emerald-400 hidden md:block transition-all duration-500 ease-in-out"
          style={{
            width: `calc(${(Math.max(1, currentStep) - 1) / (timelineSteps.length - 1)} * calc(100% - 48px))`,
          }}
        />

        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0 relative z-10">
          {timelineSteps.map((statusKey) => {
            const config = ORDER_STATUS_CONFIG[statusKey];
            const stepNumber = config.step;
            const isCompleted = currentStep >= stepNumber;
            const isCurrent = currentStep === stepNumber;

            return (
              <div key={statusKey} className="flex flex-row md:flex-col items-center gap-4 md:gap-3 group">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCompleted
                      ? "bg-emerald-400 text-surface shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                      : "bg-surface-container border-2 border-surface-container-highest text-on-surface-variant"
                  } ${isCurrent ? "scale-110" : "scale-100"}`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : config.icon}
                </div>

                <div className="flex-1 md:flex-initial md:text-center">
                  <p
                    className={`font-headline-lg text-sm uppercase transition-colors ${
                      isCompleted ? "text-emerald-400" : "text-on-surface-variant"
                    }`}
                  >
                    {config.label}
                  </p>
                  {isCurrent && (
                    <p className="font-accent-label text-[10px] tracking-widest text-on-surface uppercase mt-1 md:mt-2 animate-pulse">
                      In Progress
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
