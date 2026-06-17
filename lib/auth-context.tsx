"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { SessionUser } from "@/lib/types"

type AuthContextValue = {
  user: SessionUser | null
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
  initialUser: SessionUser | null
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser)
  const [isRefreshing, setIsRefreshing] = useState(false)

  async function refreshSession() {
    setIsRefreshing(true)

    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        cache: "no-store",
      })

      if (!response.ok) {
        setUser(null)
        return
      }

      const data = await response.json()
      setUser(data.user ?? null)
    } finally {
      setIsRefreshing(false)
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isRefreshing,
        setUser,
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
