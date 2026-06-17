import type { OrderStatus } from "@/lib/types"
import { getTimelineSteps } from "@/lib/order-display"
import { cn } from "@/lib/utils"

interface OrderTimelineProps {
  status: OrderStatus
  deliveryMethod: string
}

export function OrderTimeline({ status, deliveryMethod }: OrderTimelineProps) {
  const steps = getTimelineSteps(deliveryMethod)
  const currentIndex = steps.findIndex((step) => step.key === status)
  const visibleCurrentIndex = currentIndex >= 0 ? currentIndex : 0
  const isCancelled = status === "CANCELLED"

  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-foreground">Seguimiento del pedido</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isCancelled
            ? "Este pedido fue cancelado."
            : "Te mostramos en qué etapa se encuentra tu compra."}
        </p>
      </div>

      <div className="space-y-4 md:hidden">
        {steps.map((step, idx) => {
          const completed = !isCancelled && idx < visibleCurrentIndex
          const active = !isCancelled && idx === visibleCurrentIndex

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    completed && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary bg-primary/10 text-primary",
                    !completed && !active && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "mt-2 h-8 w-px",
                      completed ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>

              <div className="pt-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                    completed && "text-foreground",
                  )}
                >
                  {step.label}
                </p>
                {active && !isCancelled && (
                  <p className="mt-1 text-xs text-muted-foreground">Estado actual</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="hidden md:block">
        <div className="grid grid-cols-5 gap-4">
          {steps.map((step, idx) => {
            const completed = !isCancelled && idx < visibleCurrentIndex
            const active = !isCancelled && idx === visibleCurrentIndex
            const connectorDone = !isCancelled && idx < visibleCurrentIndex

            return (
              <div key={step.key} className="relative px-2 text-center">
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "absolute top-4 left-1/2 h-px w-full",
                      connectorDone ? "bg-primary" : "bg-border",
                    )}
                  />
                )}

                <div className="relative z-10 mx-auto flex w-fit flex-col items-center bg-card px-2">
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                      completed && "border-primary bg-primary text-primary-foreground",
                      active && "border-primary bg-primary/10 text-primary",
                      !completed && !active && "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {idx + 1}
                  </div>
                  <p
                    className={cn(
                      "mt-3 text-sm leading-tight",
                      active ? "font-semibold text-foreground" : "text-muted-foreground",
                      completed && "font-medium text-foreground",
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
