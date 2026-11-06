import * as React from "react"

import { api } from "@/lib/api"
import {
  getAuthToken,
  notifyAuthChanged,
  setAuthToken,
} from "@/lib/auth-storage"

export interface AuthUser {
  id: number
  name: string
  email: string
  avatar: string
}

interface AuthResponse {
  token: string
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  googleLogin: (credential: string) => Promise<AuthUser>
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<AuthUser>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(() => getAuthToken())
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loading, setLoading] = React.useState(() => Boolean(getAuthToken()))

  const applyToken = React.useCallback((nextToken: string | null) => {
    setAuthToken(nextToken)
    setToken(nextToken)
  }, [])

  const refresh = React.useCallback(async () => {
    const current = getAuthToken()
    if (!current) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const response = await api.get<{ user: AuthUser }>("/auth/me/")
      setUser(response.data.user)
      setToken(current)
    } catch {
      setUser(null)
      applyToken(null)
      notifyAuthChanged()
    } finally {
      setLoading(false)
    }
  }, [applyToken])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const login = React.useCallback(
    async (email: string, password: string) => {
      const response = await api.post<AuthResponse>("/auth/login/", { email, password })
      applyToken(response.data.token)
      setUser(response.data.user)
      setLoading(false)
      notifyAuthChanged()
      return response.data.user
    },
    [applyToken],
  )

  const register = React.useCallback(
    async (name: string, email: string, password: string) => {
      const response = await api.post<AuthResponse>("/auth/register/", {
        name,
        email,
        password,
      })
      applyToken(response.data.token)
      setUser(response.data.user)
      setLoading(false)
      notifyAuthChanged()
      return response.data.user
    },
    [applyToken],
  )

  const googleLogin = React.useCallback(
    async (credential: string) => {
      const response = await api.post<AuthResponse>("/auth/google/", { credential })
      applyToken(response.data.token)
      setUser(response.data.user)
      setLoading(false)
      notifyAuthChanged()
      return response.data.user
    },
    [applyToken],
  )

  const updateProfile = React.useCallback(
    async (data: { name?: string; avatar?: string }) => {
      const response = await api.patch<{ user: AuthUser }>("/auth/profile/", data)
      setUser(response.data.user)
      notifyAuthChanged()
      return response.data.user
    },
    [],
  )

  const logout = React.useCallback(async () => {
    try {
      await api.post("/auth/logout/")
    } catch {
      // Token may already be invalid; local logout should still work.
    } finally {
      applyToken(null)
      setUser(null)
      setLoading(false)
      notifyAuthChanged()
    }
  }, [applyToken])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      googleLogin,
      updateProfile,
      logout,
      refresh,
    }),
    [user, token, loading, login, register, googleLogin, updateProfile, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth harus dipakai di dalam AuthProvider")
  return context
}
