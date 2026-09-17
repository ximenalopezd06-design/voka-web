import { createContext, useContext, useMemo, useState } from 'react'
import { useEmployees } from '../employees/EmployeeContext'

const SESSION_KEY = 'villa-dulce-session'
const AuthContext = createContext(null)

function readStoredSession() {
  try {
    const value = sessionStorage.getItem(SESSION_KEY)
    if (!value) return null
    const parsed = JSON.parse(value)
    return parsed?.id && parsed?.rol ? parsed : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const { authenticate } = useEmployees()
  const [currentUser, setCurrentUser] = useState(readStoredSession)

  const value = useMemo(() => ({
    currentUser,
    isAuthenticated: Boolean(currentUser),
    login: async (credentials) => {
      const user = await authenticate(credentials)
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
      setCurrentUser(user)
      return user
    },
    logout: () => {
      sessionStorage.removeItem(SESSION_KEY)
      setCurrentUser(null)
    },
  }), [currentUser, authenticate])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
