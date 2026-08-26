"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { SessionUser } from "@/lib/types"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthContextValue = {
  user: SessionUser | null
  status: AuthStatus
  isAuthenticated: boolean
  isRefreshing: boolean
  setUser: (user: SessionUser | null) => void
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser?: SessionUser | null
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null)
  const [status, setStatus] = useState<AuthStatus>(
    initialUser === undefined ? "loading" : initialUser ? "authenticated" : "unauthenticated"
  )
  const [isRefreshing, setIsRefreshing] = useState(initialUser === undefined)

  function setSessionUser(nextUser: SessionUser | null) {
    setUser(nextUser)
    setStatus(nextUser ? "authenticated" : "unauthenticated")
  }

  async function refreshSession() {
    setIsRefreshing(true)

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        setSessionUser(null)
        return
      }

      const data = await response.json()
      setSessionUser(data.user ?? null)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (initialUser !== undefined) return
    void refreshSession()
    // La sesion inicial se hidrata una sola vez desde el cliente para no dinamizar el layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setSessionUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isAuthenticated: !!user,
        isRefreshing,
        setUser: setSessionUser,
        refreshSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }

  return context
}
