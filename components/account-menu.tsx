"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, LogOut, Package, User, UserPlus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountMenu() {
  const router = useRouter()
  const { user, status, logout } = useAuth()

  async function handleLogout() {
    await logout()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-md text-white/82 hover:bg-white/10 hover:text-white focus-visible:ring-white/25"
          aria-label="Mi cuenta"
        >
          <User className="size-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {status === "loading" ? (
          <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
            Cargando cuenta...
          </DropdownMenuLabel>
        ) : user ? (
          <>
            <DropdownMenuLabel className="space-y-0.5">
              <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/mi-cuenta" prefetch={false}>
                <User className="size-4" />
                Mi cuenta
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/mis-pedidos" prefetch={false}>
                <Package className="size-4" />
                Mis pedidos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault()
                void handleLogout()
              }}
            >
              <LogOut className="size-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/login" prefetch={false}>
                <LogIn className="size-4" />
                Iniciar sesion
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/registro" prefetch={false}>
                <UserPlus className="size-4" />
                Registrarse
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
