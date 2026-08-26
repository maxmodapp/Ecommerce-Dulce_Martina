import "server-only"

import { Resend } from "resend"
import { AdminNewOrderEmail } from "@/emails/admin-new-order-email"
import {
  getOrderStatusEmailSubject,
  OrderStatusEmail,
} from "@/emails/order-status-email"
import { BUSINESS_CONTACT } from "@/lib/business-config"
import type { OrderStatus } from "@/lib/types"

const DEFAULT_FROM = "Dulce Martina <pedidos@dulcemartina.com.ar>"
const DEFAULT_PRODUCTION_URL = "https://dulcemartina.com.ar"

export interface SendOrderStatusEmailInput {
  customerName: string
  customerEmail: string
  internalOrderId: string
  orderNumber: string
  status: OrderStatus
  deliveryMethod: string
  paymentMethod: string
  eventKey: string
}

export interface SendAdminNewOrderEmailInput {
  customerName: string
  customerEmail: string
  customerPhone: string
  internalOrderId: string
  orderNumber: string
  deliveryMethod: string
  paymentMethod: string
  shippingAddress: string | null
  total: number
  eventKey: string
}

export type OrderEmailResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: string }

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, "")
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) throw new Error("RESEND_API_KEY_NOT_CONFIGURED")

  const appUrl = normalizeBaseUrl(
    process.env.APP_URL ??
      (process.env.NODE_ENV === "production" ? DEFAULT_PRODUCTION_URL : "http://localhost:3000")
  )

  return {
    apiKey,
    appUrl,
    from: process.env.EMAIL_FROM?.trim() || DEFAULT_FROM,
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || BUSINESS_CONTACT.email,
    logoUrl:
      process.env.EMAIL_LOGO_URL?.trim() || `${DEFAULT_PRODUCTION_URL}/images/logo.png`,
  }
}

function getAdminNotificationEmails() {
  const configuredEmails =
    process.env.ADMIN_ORDER_NOTIFICATION_EMAILS?.trim() || BUSINESS_CONTACT.email

  return Array.from(
    new Set(
      configuredEmails
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "UNKNOWN_EMAIL_ERROR"
}

export async function sendOrderStatusEmail(
  input: SendOrderStatusEmailInput
): Promise<OrderEmailResult> {
  try {
    const config = getEmailConfig()
    const resend = new Resend(config.apiKey)
    const orderUrl = `${config.appUrl}/pedido/${encodeURIComponent(input.orderNumber)}`
    const trackingUrl = `${config.appUrl}/consultar-pedido`

    const { data, error } = await resend.emails.send(
      {
        from: config.from,
        to: input.customerEmail,
        replyTo: config.replyTo,
        subject: getOrderStatusEmailSubject(
          input.status,
          input.deliveryMethod,
          input.orderNumber
        ),
        react: (
          <OrderStatusEmail
            customerName={input.customerName}
            orderNumber={input.orderNumber}
            status={input.status}
            deliveryMethod={input.deliveryMethod}
            paymentMethod={input.paymentMethod}
            orderUrl={orderUrl}
            trackingUrl={trackingUrl}
            logoUrl={config.logoUrl}
          />
        ),
        tags: [
          { name: "category", value: "order-status" },
          { name: "status", value: input.status.toLowerCase() },
        ],
      },
      {
        idempotencyKey: input.eventKey,
      }
    )

    if (error) throw new Error(error.message)
    if (!data?.id) throw new Error("RESEND_MISSING_MESSAGE_ID")

    return { sent: true, messageId: data.id }
  } catch (error) {
    const reason = getErrorMessage(error)
    console.error("Order status email failed", {
      internalOrderId: input.internalOrderId,
      orderNumber: input.orderNumber,
      status: input.status,
      reason,
    })
    return { sent: false, reason }
  }
}

export async function sendAdminNewOrderEmail(
  input: SendAdminNewOrderEmailInput
): Promise<OrderEmailResult> {
  try {
    const config = getEmailConfig()
    const recipients = getAdminNotificationEmails()
    if (recipients.length === 0) throw new Error("ADMIN_ORDER_NOTIFICATION_EMAILS_NOT_CONFIGURED")

    const resend = new Resend(config.apiKey)
    const adminOrderUrl = `${config.appUrl}/admin/pedidos/${encodeURIComponent(input.internalOrderId)}`

    const { data, error } = await resend.emails.send(
      {
        from: config.from,
        to: recipients,
        replyTo: input.customerEmail,
        subject: `Nuevo pedido #${input.orderNumber} · ${input.customerName}`,
        react: (
          <AdminNewOrderEmail
            orderNumber={input.orderNumber}
            customerName={input.customerName}
            customerEmail={input.customerEmail}
            customerPhone={input.customerPhone}
            deliveryMethod={input.deliveryMethod}
            paymentMethod={input.paymentMethod}
            shippingAddress={input.shippingAddress}
            total={input.total}
            adminOrderUrl={adminOrderUrl}
            logoUrl={config.logoUrl}
          />
        ),
        tags: [{ name: "category", value: "admin-new-order" }],
      },
      { idempotencyKey: input.eventKey }
    )

    if (error) throw new Error(error.message)
    if (!data?.id) throw new Error("RESEND_MISSING_MESSAGE_ID")

    return { sent: true, messageId: data.id }
  } catch (error) {
    const reason = getErrorMessage(error)
    console.error("Admin new order email failed", {
      internalOrderId: input.internalOrderId,
      orderNumber: input.orderNumber,
      reason,
    })
    return { sent: false, reason }
  }
}
