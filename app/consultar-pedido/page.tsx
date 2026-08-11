import { ConsultarPedidoForm } from "./form"

export const metadata = {
  title: "Consultar pedido | Dulce Martina",
  description: "Busca el estado de tu pedido ingresando tu número de orden",
}

export default function ConsultarPedidoPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-3xl font-bold text-foreground text-center">
        Consultar pedido
      </h1>
      <p className="mt-2 text-center text-muted-foreground">
        Ingresá tu número de pedido para conocer el estado de tu compra.
      </p>
      <ConsultarPedidoForm />
    </div>
  )
}
