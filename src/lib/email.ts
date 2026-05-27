import { Resend } from "resend";
import { Order, OrderItem, Variant } from "@prisma/client";
import OrderNotification from "@/emails/OrderNotification";
import React from "react";

// Singleton Resend client
export const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || "PMD <orders@pmd.com>";

export type NotificationType = "PAID" | "SHIPPED" | "DELIVERED";

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    variant: Variant & {
      product: { name: string; images: string[] };
    };
  })[];
}

export async function sendOrderNotification(
  order: OrderWithItems,
  recipientEmail: string,
  type: NotificationType
) {
  try {
    let subject = "";
    switch (type) {
      case "PAID":
        subject = `Order Confirmed - PMD #${order.id.slice(-6).toUpperCase()}`;
        break;
      case "SHIPPED":
        subject = `Your PMD Order is on the way! #${order.id.slice(-6).toUpperCase()}`;
        break;
      case "DELIVERED":
        subject = `Your PMD Order has been delivered! #${order.id.slice(-6).toUpperCase()}`;
        break;
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: [recipientEmail],
      subject,
      react: React.createElement(OrderNotification, { order, type }),
    });

    if (error) {
      console.error("[Email Error] Failed to send order notification:", error);
      // Fire and forget: We log it, but we don't throw to prevent blocking the transaction
      return;
    }

    console.log(`[Email Success] Sent ${type} notification to ${recipientEmail}`);
  } catch (err) {
    console.error("[Email Exception] Failed to send order notification:", err);
  }
}
