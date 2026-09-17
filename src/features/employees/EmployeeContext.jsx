import { createContext, useContext, useMemo, useState } from 'react'
import { mockCredentials } from '../../data/mockCredentials'
import { mockUsers } from '../../data/mockUsers'
import { createPasswordCredential, verifyPassword } from '../auth/authService'
import { hasPermission } from '../../utils/permissions'
import { validateEmployeeProfile, validateNewPassword } from './employeeRules'

const STORAGE_KEY = 'villa-dulce-employees'
const EmployeeContext = createContext(null)

function initials(nombre, apellido = '') {
  return `${nombre?.[0] ?? ''}${apellido?.[0] ?? nombre?.split(' ')?.[1]?.[0] ?? ''}`.toUpperCase()
}

function initialEmployees() {
  return mockUsers.map((user) => ({
    ...user,
    nombre: user.nombre.split(' ')[0],
    apellido: user.nombre.split(' ').slice(1).join(' '),
    fechaCreacion: '2026-07-01',
    ultimaSesion: user.rol === 'ADMINISTRADOR' ? '2026-07-25 18:42' : '2026-07-25 16:10',
    credential: mockCredentials[user.id],
    permisos: {},
  }))
}

function readEmployees() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(stored) && stored.length ? stored : initialEmployees()
  } catch {
    return initialEmployees()
  }
}

function publicEmployee(employee) {
  const { credential, ...safeEmployee } = employee
  return { ...safeEmployee, nombre: `${employee.nombre} ${employee.apellido}`.trim() }
}

function requireEmployeeManagement(actor, action) {
  if (actor?.rol !== 'ADMINISTRADOR' || !hasPermission(actor, 'configuracion', action)) throw new Error('FORBIDDEN')
}

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState(readEmployees)

  function persist(updater) {
    setEmployees((current) => {
      const next = typeof updater === 'function' ? updater(current) : updater
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const value = useMemo(() => ({
    employees,
    loginProfiles: employees.filter((item) => item.estado === 'ACTIVO').map(publicEmployee),
    authenticate: async ({ userId, password }) => {
      const employee = employees.find((item) => item.id === userId)
      if (!employee || employee.estado !== 'ACTIVO' || !await verifyPassword(password, employee.credential)) {
        throw new Error('INVALID_CREDENTIALS')
      }
      const now = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
      persist((current) => current.map((item) => item.id === userId ? { ...item, ultimaSesion: now } : item))
      return publicEmployee({ ...employee, ultimaSesion: now })
    },
    createEmployee: async (data, actor) => {
      requireEmployeeManagement(actor, 'create')
      const validationErrors = validateEmployeeProfile(data, employees)
      if (Object.keys(validationErrors).length) {
        const error = new Error('INVALID_EMPLOYEE')
        error.validationErrors = validationErrors
        throw error
      }
      const passwordError = validateNewPassword(data.password, data.passwordConfirmation)
      if (passwordError) throw new Error(passwordError)
      const employee = {
        id: `user-${Date.now().toString(36)}`,
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        username: data.username.trim(),
        email: data.email?.trim() ?? '',
        telefono: data.telefono?.trim() ?? '',
        rol: data.rol,
        rolLabel: data.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Cajera',
        estado: data.estado,
        iniciales: initials(data.nombre, data.apellido),
        avatarTone: data.rol === 'ADMINISTRADOR' ? 'pink' : 'blue',
        fechaCreacion: new Date().toISOString().slice(0, 10),
        ultimaSesion: null,
        permisos: data.permisos ?? {},
        credential: await createPasswordCredential(data.password),
      }
      persist((current) => [employee, ...current])
      return employee
    },
    updateEmployee: async (id, data, actor) => {
      requireEmployeeManagement(actor, 'edit')
      const existing = employees.find((item) => item.id === id)
      if (!existing) throw new Error('EMPLOYEE_NOT_FOUND')
      const validationErrors = validateEmployeeProfile(data, employees, id)
      if (Object.keys(validationErrors).length) {
        const error = new Error('INVALID_EMPLOYEE')
        error.validationErrors = validationErrors
        throw error
      }
      const { password, passwordConfirmation, ...profileData } = data
      persist((current) => current.map((item) => item.id === id ? {
        ...item,
        ...profileData,
        rolLabel: data.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Cajera',
        iniciales: initials(data.nombre, data.apellido),
        avatarTone: data.rol === 'ADMINISTRADOR' ? 'pink' : 'blue',
        credential: item.credential,
      } : item))
    },
    changeEmployeePassword: async (id, password, confirmation, actor) => {
      requireEmployeeManagement(actor, 'manage')
      if (!employees.some((item) => item.id === id)) throw new Error('EMPLOYEE_NOT_FOUND')
      const passwordError = validateNewPassword(password, confirmation)
      if (passwordError) throw new Error(passwordError)
      const credential = await createPasswordCredential(password)
      persist((current) => current.map((item) => item.id === id ? { ...item, credential } : item))
    },
    changeOwnPassword: async (password, confirmation, actor) => {
      if (actor?.rol !== 'ADMINISTRADOR' || !actor?.id || !employees.some((item) => item.id === actor.id)) throw new Error('FORBIDDEN')
      const passwordError = validateNewPassword(password, confirmation)
      if (passwordError) throw new Error(passwordError)
      const credential = await createPasswordCredential(password)
      persist((current) => current.map((item) => item.id === actor.id ? { ...item, credential } : item))
    },
    toggleEmployeeStatus: (id, actor) => {
      requireEmployeeManagement(actor, 'edit')
      if (id === actor.id) throw new Error('SELF_DEACTIVATION')
      persist((current) => current.map((item) => (
        item.id === id ? { ...item, estado: item.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' } : item
      )))
    },
    getEmployeeById: (id) => employees.find((item) => item.id === id),
  }), [employees])

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>
}

export function useEmployees() {
  const context = useContext(EmployeeContext)
  if (!context) throw new Error('useEmployees debe utilizarse dentro de EmployeeProvider')
  return context
}
