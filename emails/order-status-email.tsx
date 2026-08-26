import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email"
import { BUSINESS_CONTACT } from "@/lib/business-config"
import { getTimelineSteps } from "@/lib/order-display"
import type { OrderStatus } from "@/lib/types"

export interface OrderStatusEmailProps {
  customerName: string
  orderNumber: string
  status: OrderStatus
  deliveryMethod: string
  paymentMethod: string
  orderUrl: string
  trackingUrl: string
  logoUrl: string
}

function getStatusCopy(status: OrderStatus, deliveryMethod: string) {
  const isPickup = deliveryMethod === "PICKUP"

  switch (status) {
    case "PENDING":
      return {
        title: "Recibimos tu pedido",
        description:
          "Tu pedido fue registrado correctamente. Ya lo estamos revisando y te avisaremos cuando avance a la siguiente etapa.",
      }
    case "CONFIRMED":
      return {
        title: "Tu pedido fue confirmado",
        description: "Confirmamos tu pedido y pronto continuaremos con la preparacion.",
      }
    case "PAYMENT_CONFIRMED":
      return {
        title: "Confirmamos tu pago",
        description: "El pago fue recibido correctamente. Ahora continuaremos preparando tu pedido.",
      }
    case "READY":
      return {
        title: "Estamos preparando tu pedido",
        description: "Estamos preparando cada producto con cuidado para la siguiente etapa.",
      }
    case "SHIPPED":
      return isPickup
        ? {
            title: "Tu pedido esta listo para retirar",
            description: "Ya podes retirar tu pedido por nuestro local.",
          }
        : {
            title: "Tu pedido fue enviado",
            description: "Tu compra ya fue despachada y esta en camino a la direccion indicada.",
          }
    case "DELIVERED":
      return isPickup
        ? {
            title: "¡Tu pedido fue retirado!",
            description:
              "Gracias por elegir Dulce Martina. Esperamos que disfrutes tu compra. Si existe algun inconveniente, podes comunicarte con nosotros.",
          }
        : {
            title: "¡Tu pedido fue entregado!",
            description:
              "Gracias por elegir Dulce Martina. Si existe algun inconveniente, podes comunicarte con nosotros.",
          }
    case "CANCELLED":
      return {
        title: "Tu pedido fue cancelado",
        description:
          "El pedido fue cancelado. Si tenes alguna duda o necesitas ayuda, comunicate con nosotros.",
      }
  }
}

export function getOrderStatusEmailSubject(
  status: OrderStatus,
  deliveryMethod: string,
  orderNumber: string
) {
  const copy = getStatusCopy(status, deliveryMethod)
  return `${copy.title} · Pedido #${orderNumber}`
}

function OrderTimelineEmail({
  status,
  deliveryMethod,
  paymentMethod,
}: Pick<OrderStatusEmailProps, "status" | "deliveryMethod" | "paymentMethod">) {
  const steps = getTimelineSteps(deliveryMethod, paymentMethod)
  const currentIndex = steps.findIndex((step) => step.key === status)

  return (
    <Section style={timelineContainerStyle}>
      <Text style={eyebrowStyle}>SEGUIMIENTO DEL PEDIDO</Text>
      {steps.map((step, index) => {
        const completed = currentIndex >= 0 && index < currentIndex
        const active = index === currentIndex
        const marker = completed ? "✓" : active ? "●" : String(index + 1)

        return (
          <table
            key={step.key}
            role="presentation"
            width="100%"
            cellPadding="0"
            cellSpacing="0"
          >
            <tbody>
              <tr>
                <td style={timelineMarkerCellStyle} valign="top">
                  <div
                    style={{
                      ...timelineMarkerStyle,
                      ...(completed || active ? timelineMarkerActiveStyle : {}),
                    }}
                  >
                    {marker}
                  </div>
                  {index < steps.length - 1 ? (
                    <div
                      style={{
                        ...timelineConnectorStyle,
                        ...(completed ? timelineConnectorActiveStyle : {}),
                      }}
                    />
                  ) : null}
                </td>
                <td style={timelineLabelCellStyle} valign="top">
                  <Text
                    style={{
                      ...timelineLabelStyle,
                      ...(active ? timelineLabelActiveStyle : {}),
                    }}
                  >
                    {step.label}
                  </Text>
                  {active ? <Text style={currentStatusStyle}>Estado actual</Text> : null}
                </td>
              </tr>
            </tbody>
          </table>
        )
      })}
    </Section>
  )
}

export function OrderStatusEmail({
  customerName,
  orderNumber,
  status,
  deliveryMethod,
  paymentMethod,
  orderUrl,
  trackingUrl,
  logoUrl,
}: OrderStatusEmailProps) {
  const copy = getStatusCopy(status, deliveryMethod)
  const isClosingEmail = status === "DELIVERED" || status === "CANCELLED"

  return (
    <Html lang="es">
      <Head />
      <Preview>{`${copy.title} · Pedido #${orderNumber}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Img src={logoUrl} alt="Dulce Martina" width="92" height="92" style={logoStyle} />
          </Section>

          <Section style={contentStyle}>
            <Text style={greetingStyle}>Hola, {customerName}</Text>
            <Heading style={headingStyle}>{copy.title}</Heading>
            <Text style={descriptionStyle}>{copy.description}</Text>

            {!isClosingEmail ? (
              <OrderTimelineEmail
                status={status}
                deliveryMethod={deliveryMethod}
                paymentMethod={paymentMethod}
              />
            ) : null}

            <Section style={orderCodeStyle}>
              <Text style={eyebrowStyle}>CODIGO DEL PEDIDO</Text>
              <Text style={orderNumberStyle}>#{orderNumber}</Text>
            </Section>

            <Text style={trackingCopyStyle}>
              Podes seguir el estado de tu pedido en todo momento desde{" "}
              <Link href={trackingUrl} style={inlineLinkStyle}>
                dulcemartina.com.ar/consultar-pedido
              </Link>{" "}
              ingresando el numero de tu orden o desde el siguiente boton.
            </Text>

            <Section style={buttonSectionStyle}>
              <Button href={orderUrl} style={buttonStyle}>
                Ver mi pedido
              </Button>
            </Section>
          </Section>

          <Hr style={dividerStyle} />

          <Section style={footerStyle}>
            <Heading as="h2" style={helpHeadingStyle}>
              ¿Necesitas ayuda?
            </Heading>
            <Text style={footerTextStyle}>
              Estamos para ayudarte. Podes comunicarte con nosotros por cualquiera de estos medios.
            </Text>
            <Text style={contactLinksStyle}>
              <Link href={BUSINESS_CONTACT.whatsappUrl} style={footerLinkStyle}>
                WhatsApp
              </Link>
              {"  ·  "}
              <Link href={BUSINESS_CONTACT.instagramUrl} style={footerLinkStyle}>
                Instagram
              </Link>
              {"  ·  "}
              <Link href={`mailto:${BUSINESS_CONTACT.email}`} style={footerLinkStyle}>
                Correo
              </Link>
            </Text>
            <Text style={legalStyle}>Dulce Martina · Saladillo, Buenos Aires</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const bodyStyle = {
  backgroundColor: "#f3f1ee",
  color: "#171717",
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: 0,
  padding: "28px 12px",
}

const containerStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #dedad5",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "580px",
  overflow: "hidden",
}

const headerStyle = { backgroundColor: "#000000", padding: "24px", textAlign: "center" as const }
const logoStyle = { borderRadius: "50%", margin: "0 auto", objectFit: "cover" as const }
const contentStyle = { padding: "34px 34px 18px" }
const greetingStyle = { color: "#6d6d6d", fontSize: "16px", lineHeight: "24px", margin: "0 0 8px" }
const headingStyle = { color: "#171717", fontFamily: "Georgia, serif", fontSize: "30px", lineHeight: "38px", margin: "0 0 14px" }
const descriptionStyle = { color: "#55514d", fontSize: "16px", lineHeight: "26px", margin: "0 0 26px" }
const timelineContainerStyle = { backgroundColor: "#f7f6f4", borderRadius: "12px", padding: "20px 20px 12px", margin: "0 0 24px" }
const eyebrowStyle = { color: "#77716b", fontSize: "11px", fontWeight: "bold", letterSpacing: "1.4px", lineHeight: "16px", margin: "0 0 14px" }
const timelineMarkerCellStyle = { width: "34px" }
const timelineMarkerStyle = { backgroundColor: "#ffffff", border: "1px solid #d5d1cc", borderRadius: "50%", color: "#8b857d", fontSize: "12px", fontWeight: "bold", height: "26px", lineHeight: "26px", textAlign: "center" as const, width: "26px" }
const timelineMarkerActiveStyle = { backgroundColor: "#171717", borderColor: "#171717", color: "#ffffff" }
const timelineConnectorStyle = { borderLeft: "2px solid #d8d4cf", height: "22px", marginLeft: "12px" }
const timelineConnectorActiveStyle = { borderLeftColor: "#171717" }
const timelineLabelCellStyle = { paddingBottom: "8px" }
const timelineLabelStyle = { color: "#88827c", fontSize: "14px", lineHeight: "20px", margin: "3px 0 0" }
const timelineLabelActiveStyle = { color: "#171717", fontWeight: "bold" }
const currentStatusStyle = { color: "#8b857d", fontSize: "11px", lineHeight: "16px", margin: "1px 0 0" }
const orderCodeStyle = { border: "1px solid #dedad5", borderRadius: "12px", padding: "18px 20px", textAlign: "center" as const, margin: "0 0 22px" }
const orderNumberStyle = { color: "#171717", fontFamily: "Georgia, serif", fontSize: "30px", fontWeight: "bold", letterSpacing: "2px", lineHeight: "34px", margin: 0 }
const trackingCopyStyle = { color: "#65605b", fontSize: "14px", lineHeight: "23px", margin: "0 0 22px" }
const inlineLinkStyle = { color: "#171717", fontWeight: "bold", textDecoration: "underline" }
const buttonSectionStyle = { textAlign: "center" as const, margin: "0 0 16px" }
const buttonStyle = { backgroundColor: "#171717", borderRadius: "8px", color: "#ffffff", display: "inline-block", fontSize: "16px", fontWeight: "bold", padding: "14px 28px", textDecoration: "none" }
const dividerStyle = { borderColor: "#e4e1dd", margin: "12px 34px 0" }
const footerStyle = { padding: "24px 34px 30px", textAlign: "center" as const }
const helpHeadingStyle = { color: "#171717", fontFamily: "Georgia, serif", fontSize: "20px", lineHeight: "28px", margin: "0 0 8px" }
const footerTextStyle = { color: "#77716b", fontSize: "13px", lineHeight: "20px", margin: "0 auto 14px", maxWidth: "420px" }
const contactLinksStyle = { fontSize: "13px", lineHeight: "20px", margin: "0 0 18px" }
const footerLinkStyle = { color: "#171717", fontWeight: "bold", textDecoration: "underline" }
const legalStyle = { color: "#a09a94", fontSize: "11px", lineHeight: "16px", margin: 0 }
