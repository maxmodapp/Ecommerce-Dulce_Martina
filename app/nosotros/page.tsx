import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, Truck, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Nosotros | Dulce Martina",
  description:
    "Conoce nuestra historia. Somos Dulce Martina, una marca de moda femenina y lenceria con pasion por la elegancia y la comodidad.",
}

const values = [
  {
    icon: Heart,
    title: "Pasion",
    description:
      "Cada prenda esta pensada con amor y dedicacion. Creemos que la ropa que usas debe hacerte sentir especial.",
  },
  {
    icon: Shield,
    title: "Calidad",
    description:
      "Seleccionamos los mejores materiales y cuidamos cada detalle de la confeccion para ofrecerte prendas que duran.",
  },
  {
    icon: Truck,
    title: "Envios a todo el pais",
    description:
      "Llevamos nuestras prendas a cada rincon de Argentina. Envio gratis en compras mayores a $30.000.",
  },
  {
    icon: MessageCircle,
    title: "Atencion personalizada",
    description:
      "Te acompanamos en cada paso de tu compra. Escribinos por WhatsApp y te asesoramos con lo que necesites.",
  },
]

export default function NosotrosPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/about.jpg"
            alt="Taller Dulce Martina"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <div className="max-w-lg">
            <h1 className="font-serif text-4xl font-bold text-primary-foreground md:text-5xl text-balance">
              Nuestra historia
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              Detras de cada prenda hay una historia de pasion, dedicacion
              y amor por la moda femenina.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Dulce Martina
          </h2>
          <div className="mt-6 flex flex-col gap-4 text-muted-foreground leading-relaxed">
            <p>
              Dulce Martina nacio con la idea de ofrecer prendas femeninas que
              combinan elegancia, comodidad y un toque personal. Desde nuestros
              inicios, nos enfocamos en crear ropa que haga sentir a cada mujer
              unica y segura de si misma.
            </p>
            <p>
              Nuestra coleccion incluye remeras, pantalones y lenceria
              cuidadosamente seleccionada, pensada para acompanar tu dia a dia
              con estilo. Creemos que la moda debe ser accesible, de calidad y,
              sobre todo, debe hacerte feliz.
            </p>
            <p>
              Trabajamos con los mejores materiales y prestamos atencion a cada
              detalle de confeccion. Cada temporada renovamos nuestra coleccion
              con las ultimas tendencias, siempre manteniendo nuestra esencia:
              feminidad, delicadeza y confianza.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="mb-10 text-center font-serif text-3xl font-bold text-foreground">
            Nuestros valores
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-card-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="rounded-2xl bg-primary/10 p-8 text-center md:p-12">
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl text-balance">
            {"¿Lista para descubrir tu nuevo favorito?"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Explora nuestra coleccion y encontra la prenda perfecta para vos.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/productos">
                Ver productos
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-secondary"
            >
              <a
                href="https://wa.me/5491100000000?text=Hola!%20Quiero%20saber%20mas%20sobre%20Dulce%20Martina"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-2 size-4" />
                Contactanos
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
