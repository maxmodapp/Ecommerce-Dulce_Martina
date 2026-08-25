import { BUSINESS_CONTACT } from "@/lib/business-config"

const STORAGE_PREFIX = "dulce-martina:order-whatsapp:"

export function getOrderWhatsAppStorageKey(orderNumber: string) {
  return `${STORAGE_PREFIX}${orderNumber}`
}

export function isOrderWhatsAppUrl(value: string) {
  return value.startsWith(`${BUSINESS_CONTACT.whatsappUrl}?text=`)
}
