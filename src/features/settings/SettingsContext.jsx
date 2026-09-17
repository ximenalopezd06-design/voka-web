import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useCurrentUser } from '../auth/useCurrentUser'

const PREFERENCES_KEY = 'villa-dulce-user-preferences'
const BUSINESS_KEY = 'villa-dulce-business-settings'
const SYSTEM_KEY = 'villa-dulce-system-settings'
const SettingsContext = createContext(null)

const DEFAULT_PREFERENCES = {
  theme: 'light',
  fontSize: 'medium',
  density: 'normal',
  notifications: {
    enabled: true,
    lowStock: true,
    purchaseRequests: true,
    requestApproved: true,
    requestRejected: true,
  },
}

const DEFAULT_BUSINESS = {
  name: 'Villa Dulce',
  logo: '',
  email: '',
  phone: '',
  address: 'Mazatlán, Sinaloa',
  contact: '',
  legalName: 'Villa Dulce S.A. de C.V.',
  rfc: 'VDU260701XX1',
  city: 'Mazatlán',
  state: 'Sinaloa',
  postalCode: '82000',
}

const DEFAULT_SYSTEM_SETTINGS = {
  general: { systemName: 'Villa Dulce', language: 'es-MX', currency: 'MXN', timezone: 'America/Mazatlan', dateFormat: 'DD/MM/YYYY', timeFormat: '12h', decimals: 2 },
  sales: { folioSeries: 'V', holdMinutes: 120, ticketPreview: true, cancelAuthorization: true, allowDiscounts: true, autoPrint: false },
  inventory: { defaultMinimumStock: 10, lowStockAlerts: true, automaticSaleUpdate: true, manualAdjustments: true },
  purchases: { requestSeries: 'SC', requireApproval: true, autoEmailProvider: false, draftReviewDays: 7 },
  appearance: { institutionalColor: '#c44e75', animations: true },
  backups: { lastBackup: '2026-07-29 23:00', frequency: 'daily' },
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

export function SettingsProvider({ children }) {
  const user = useCurrentUser()
  const [allPreferences, setAllPreferences] = useState(() => readJson(PREFERENCES_KEY, {}))
  const [business, setBusinessState] = useState(() => ({ ...DEFAULT_BUSINESS, ...readJson(BUSINESS_KEY, {}) }))
  const [systemSettings, setSystemSettingsState] = useState(() => {
    const stored = readJson(SYSTEM_KEY, {})
    return Object.fromEntries(Object.entries(DEFAULT_SYSTEM_SETTINGS).map(([section, values]) => [section, { ...values, ...(stored[section] ?? {}) }]))
  })
  const preferences = { ...DEFAULT_PREFERENCES, ...(allPreferences[user?.id] ?? {}), notifications: { ...DEFAULT_PREFERENCES.notifications, ...(allPreferences[user?.id]?.notifications ?? {}) } }

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      root.dataset.theme = preferences.theme === 'auto' ? (media?.matches ? 'dark' : 'light') : preferences.theme
    }
    applyTheme()
    root.dataset.fontSize = preferences.fontSize
    root.dataset.density = preferences.density
    if (preferences.theme === 'auto') media?.addEventListener('change', applyTheme)
    return () => media?.removeEventListener('change', applyTheme)
  }, [preferences.theme, preferences.fontSize, preferences.density])

  const value = useMemo(() => ({
    preferences,
    business,
    systemSettings,
    updatePreferences: (patch) => {
      if (!user) return
      setAllPreferences((current) => {
        const existing = current[user.id] ?? DEFAULT_PREFERENCES
        const next = { ...current, [user.id]: { ...existing, ...patch, notifications: patch.notifications ? { ...existing.notifications, ...patch.notifications } : existing.notifications } }
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next))
        return next
      })
    },
    updateBusiness: (patch) => {
      if (user?.rol !== 'ADMINISTRADOR') throw new Error('FORBIDDEN')
      setBusinessState((current) => {
        const next = { ...current, ...patch }
        localStorage.setItem(BUSINESS_KEY, JSON.stringify(next))
        return next
      })
    },
    updateSystemSettings: (section, patch) => {
      if (user?.rol !== 'ADMINISTRADOR') throw new Error('FORBIDDEN')
      setSystemSettingsState((current) => {
        const next = { ...current, [section]: { ...current[section], ...patch } }
        localStorage.setItem(SYSTEM_KEY, JSON.stringify(next))
        return next
      })
    },
  }), [preferences, business, systemSettings, user])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings debe utilizarse dentro de SettingsProvider')
  return context
}
