import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email"
import { formatPrice } from "@/lib/data"
import { getDeliveryMethodLabel, getPaymentMethodLabel } from "@/lib/order-display"

export interface AdminNewOrderEmailProps {
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryMethod: string
  paymentMethod: string
  shippingAddress: string | null
  total: number
  adminOrderUrl: string
  logoUrl: string
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td style={labelCellStyle}>{label}</td>
      <td style={valueCellStyle}>{children}</td>
    </tr>
  )
}

export function AdminNewOrderEmail({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  deliveryMethod,
  paymentMethod,
  shippingAddress,
  total,
  adminOrderUrl,
  logoUrl,
}: AdminNewOrderEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{`Nuevo pedido #${orderNumber} de ${customerName}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Img src={logoUrl} alt="Dulce Martina" width="76" height="76" style={logoStyle} />
          </Section>

          <Section style={contentStyle}>
            <Text style={eyebrowStyle}>NOTIFICACIÓN ADMINISTRATIVA</Text>
            <Heading style={headingStyle}>Nuevo pedido #{orderNumber}</Heading>
            <Text style={descriptionStyle}>
              Se registró un nuevo pedido en la tienda. Estos son los datos principales para
              comenzar a gestionarlo.
            </Text>

            <Section style={detailsStyle}>
              <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                  <DetailRow label="Cliente">{customerName}</DetailRow>
                  <DetailRow label="Correo">
                    <Link href={`mailto:${customerEmail}`} style={linkStyle}>
                      {customerEmail}
                    </Link>
                  </DetailRow>
                  <DetailRow label="Teléfono">
                    <Link href={`tel:${customerPhone}`} style={linkStyle}>
                      {customerPhone}
                    </Link>
                  </DetailRow>
                  <DetailRow label="Entrega">{getDeliveryMethodLabel(deliveryMethod)}</DetailRow>
                  {shippingAddress ? (
                    <DetailRow label="Dirección">{shippingAddress}</DetailRow>
                  ) : null}
                  <DetailRow label="Pago">{getPaymentMethodLabel(paymentMethod)}</DetailRow>
                  <DetailRow label="Total">
                    <strong>{formatPrice(total)}</strong>
                  </DetailRow>
                </tbody>
              </table>
            </Section>

            <Section style={buttonSectionStyle}>
              <Button href={adminOrderUrl} style={buttonStyle}>
                Abrir pedido en administración
              </Button>
            </Section>

            <Text style={helpStyle}>
              El enlace abre el detalle interno del pedido y requiere iniciar sesión como
              administrador.
            </Text>
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
const headerStyle = { backgroundColor: "#000000", padding: "20px", textAlign: "center" as const }
const logoStyle = { borderRadius: "50%", margin: "0 auto", objectFit: "cover" as const }
const contentStyle = { padding: "32px 34px 34px" }
const eyebrowStyle = {
  color: "#77716b",
  fontSize: "11px",
  fontWeight: "bold",
  letterSpacing: "1.4px",
  lineHeight: "16px",
  margin: "0 0 10px",
}
const headingStyle = {
  color: "#171717",
  fontFamily: "Georgia, serif",
  fontSize: "29px",
  lineHeight: "37px",
  margin: "0 0 12px",
}
const descriptionStyle = {
  color: "#55514d",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 24px",
}
const detailsStyle = {
  backgroundColor: "#f7f6f4",
  borderRadius: "12px",
  margin: "0 0 24px",
  padding: "10px 18px",
}
const labelCellStyle = {
  borderBottom: "1px solid #e1ddd8",
  color: "#77716b",
  fontSize: "13px",
  padding: "11px 12px 11px 0",
  verticalAlign: "top" as const,
  width: "100px",
}
const valueCellStyle = {
  borderBottom: "1px solid #e1ddd8",
  color: "#171717",
  fontSize: "14px",
  lineHeight: "20px",
  padding: "11px 0",
  verticalAlign: "top" as const,
}
const linkStyle = { color: "#171717", textDecoration: "underline" }
const buttonSectionStyle = { margin: "0 0 16px", textAlign: "center" as const }
const buttonStyle = {
  backgroundColor: "#171717",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "15px",
  fontWeight: "bold",
  padding: "14px 24px",
  textDecoration: "none",
}
const helpStyle = {
  color: "#8a847e",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
  textAlign: "center" as const,
}
