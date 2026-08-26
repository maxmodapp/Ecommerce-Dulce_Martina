import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { getCatalogMenu } from "@/lib/catalog"
import { AuthProvider } from "@/lib/auth-context"
import { CartProvider } from "@/lib/cart-context"
import { CartDrawerProvider } from "@/lib/cart-drawer-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Dulce Martina | Lingerie & Moda Femenina",
  description:
    "Tienda online de ropa femenina y lenceria. Remeras, pantalones, ropa interior. Elegancia, comodidad y estilo.",
}

export const viewport: Viewport = {
  themeColor: "#fde0d7",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const catalogMenu = await getCatalogMenu()

  return (
    <html lang="es">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <CartDrawerProvider>
              <Navbar catalogMenu={catalogMenu} />
              <CartDrawer />
              <main className="min-h-screen">{children}</main>
              <Footer catalogMenu={catalogMenu} />
            </CartDrawerProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
