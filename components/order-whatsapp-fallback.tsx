"use client"

import { useEffect, useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BUSINESS_CONTACT } from "@/lib/business-config"
import {
  getOrderWhatsAppStorageKey,
  isOrderWhatsAppUrl,
} from "@/lib/order-whatsapp"

export function OrderWhatsAppFallback({ orderNumber }: { orderNumber: string }) {
  const [whatsappUrl, setWhatsappUrl] = useState<string>(BUSINESS_CONTACT.whatsappUrl)
  const storageKey = getOrderWhatsAppStorageKey(orderNumber)

  useEffect(() => {
    const storedUrl = window.sessionStorage.getItem(storageKey)
    if (storedUrl && isOrderWhatsAppUrl(storedUrl)) setWhatsappUrl(storedUrl)
  }, [storageKey])

  function handleClick() {
    window.sessionStorage.removeItem(storageKey)
  }

  return (
    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
      <p className="text-sm">
        El navegador bloqueo la apertura automatica de WhatsApp. Tu pedido ya fue guardado; usa
        este boton para enviar el mensaje.
      </p>
      <Button asChild className="mt-3 w-full sm:w-auto">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
        >
          <MessageCircle className="mr-2 size-4" />
          Enviar pedido por WhatsApp
        </a>
      </Button>
    </div>
  )
}
