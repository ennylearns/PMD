import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { OrderWithItems, NotificationType } from "../lib/email";

interface OrderNotificationProps {
  order: OrderWithItems;
  type: NotificationType;
}

export const OrderNotification = ({ order, type }: OrderNotificationProps) => {
  const isPaid = type === "PAID";
  const isShipped = type === "SHIPPED";
  const isDelivered = type === "DELIVERED";

  let title = "";
  let previewText = "";

  if (isPaid) {
    title = "Order Confirmed";
    previewText = `Your PMD order #${order.id.slice(-6).toUpperCase()} is confirmed.`;
  } else if (isShipped) {
    title = "Order Shipped";
    previewText = `Good news! Your PMD order #${order.id.slice(-6).toUpperCase()} has shipped.`;
  } else if (isDelivered) {
    title = "Order Delivered";
    previewText = `Your PMD order #${order.id.slice(-6).toUpperCase()} has been delivered!`;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pmd-ecommerce.vercel.app";
  const trackingUrl = `${appUrl}/order/${order.id}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>PMD</Heading>
          <Text style={h2}>{title}</Text>
          
          <Text style={text}>
            {isPaid && "We've received your order and are getting it ready to ship."}
            {isShipped && "Your order is on the way! It has left our fulfillment origin."}
            {isDelivered && "Your order has arrived. We hope you love your new gear."}
          </Text>

          <Button style={button} href={trackingUrl}>
            Track Your Order
          </Button>

          <Hr style={hr} />

          <Text style={h3}>Order Summary</Text>
          <Text style={text}>Order ID: #{order.id.slice(-6).toUpperCase()}</Text>

          {order.items.map((item) => (
            <Section key={item.id} style={itemRow}>
              <Text style={itemName}>
                {item.quantity}x {item.variant.product.name} ({item.variant.color}, {item.variant.size})
              </Text>
              <Text style={itemPrice}>₦{item.price.toLocaleString()}</Text>
            </Section>
          ))}

          <Hr style={hr} />

          <Section style={totalsRow}>
            <Text style={totalsLabel}>Subtotal</Text>
            <Text style={totalsValue}>₦{(order.totalAmount - order.shippingFee).toLocaleString()}</Text>
          </Section>
          <Section style={totalsRow}>
            <Text style={totalsLabel}>Delivery Fee</Text>
            <Text style={totalsValue}>₦{order.shippingFee.toLocaleString()}</Text>
          </Section>
          <Section style={totalsRow}>
            <Text style={totalsLabel}>Total</Text>
            <Text style={totalsValue}>₦{order.totalAmount.toLocaleString()}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            PMD Streetwear<br />
            Jos, Plateau State, Nigeria
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderNotification;

const main = {
  backgroundColor: "#000000",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  backgroundColor: "#111111",
  borderRadius: "8px",
  marginTop: "40px",
  color: "#ffffff",
};

const h1 = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
  letterSpacing: "0.1em",
};

const h2 = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "600",
  padding: "0 40px",
};

const h3 = {
  color: "#a3a3a3",
  fontSize: "16px",
  fontWeight: "600",
  padding: "0 40px",
  textTransform: "uppercase" as const,
};

const text = {
  color: "#d4d4d4",
  fontSize: "16px",
  lineHeight: "24px",
  padding: "0 40px",
};

const button = {
  backgroundColor: "#ffffff",
  borderRadius: "4px",
  color: "#000000",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  maxWidth: "200px",
  margin: "24px 40px",
  padding: "14px 7px",
};

const hr = {
  borderColor: "#333333",
  margin: "24px 0",
};

const itemRow = {
  padding: "8px 40px",
  display: "flex",
  justifyContent: "space-between",
};

const itemName = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "0",
};

const itemPrice = {
  color: "#ffffff",
  fontSize: "14px",
  margin: "0",
  textAlign: "right" as const,
};

const totalsRow = {
  padding: "4px 40px",
  display: "flex",
  justifyContent: "space-between",
};

const totalsLabel = {
  color: "#a3a3a3",
  fontSize: "14px",
  margin: "0",
};

const totalsValue = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
  textAlign: "right" as const,
};

const footer = {
  color: "#737373",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "48px 0 0",
};
