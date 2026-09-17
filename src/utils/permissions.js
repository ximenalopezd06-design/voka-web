export const ROLE_PERMISSIONS = {
  ADMINISTRADOR: {
    dashboard: ['view', 'manage'],
    ventas: ['view', 'create', 'edit', 'delete', 'manage'],
    compras: ['view', 'create', 'edit', 'delete', 'manage'],
    inventario: ['view', 'create', 'edit', 'delete', 'manage'],
    movimientos: ['view', 'create', 'manage'],
    catalogo: ['view', 'create', 'edit', 'delete', 'manage'],
    proveedores: ['view', 'create', 'edit', 'manage'],
    reportes: ['view', 'manage'],
    configuracion: ['view', 'create', 'edit', 'delete', 'manage'],
  },
  CAJERA: {
    dashboard: ['view'],
    ventas: ['view', 'create'],
    compras: ['view', 'create'],
    inventario: ['view'],
    movimientos: ['view', 'create'],
    catalogo: ['view'],
    proveedores: [],
    reportes: [],
    configuracion: [],
  },
}

export const routeRequirements = {
  '/dashboard': ['dashboard', 'view'],
  '/ventas': ['ventas', 'view'],
  '/ventas/nueva': ['ventas', 'create'],
  '/compras': ['compras', 'view'],
  '/compras/nueva': ['compras', 'manage'],
  '/compras/solicitudes': ['compras', 'view'],
  '/compras/borradores': ['compras', 'create'],
  '/compras/nueva-solicitud': ['compras', 'create'],
  '/compras/solicitudes/:id/editar': ['compras', 'create'],
  '/compras/solicitudes/:id': ['compras', 'view'],
  '/entradas': ['movimientos', 'create'],
  '/salidas': ['movimientos', 'create'],
  '/inventario': ['inventario', 'view'],
  '/inventario/movimientos': ['movimientos', 'view'],
  '/inventario/nuevo-movimiento': ['movimientos', 'create'],
  '/inventario/nueva-entrada': ['movimientos', 'create'],
  '/inventario/nueva-salida': ['movimientos', 'create'],
  '/inventario/ajustes': ['movimientos', 'create'],
  '/inventario/conteos': ['movimientos', 'manage'],
  '/inventario/aprobaciones': ['movimientos', 'manage'],
  '/inventario/movimientos/:id': ['movimientos', 'view'],
  '/inventario/alertas': ['inventario', 'view'],
  '/catalogo': ['catalogo', 'view'],
  '/catalogo/nuevo': ['catalogo', 'create'],
  '/catalogo/editar/:id': ['catalogo', 'edit'],
  '/proveedores': ['proveedores', 'view'],
  '/proveedores/nuevo': ['proveedores', 'create'],
  '/proveedores/editar/:id': ['proveedores', 'edit'],
  '/proveedores/:id': ['proveedores', 'view'],
  '/configuracion': ['configuracion', 'view'],
  '/reportes': ['reportes', 'view'],
}

export function getEffectivePermissions(user) {
  if (!user) return {}
  const defaults = ROLE_PERMISSIONS[user.rol] ?? {}
  const overrides = user.permisos ?? {}
  const modules = new Set([...Object.keys(defaults), ...Object.keys(overrides)])

  return Object.fromEntries([...modules].map((module) => {
    const base = Object.fromEntries(['view', 'create', 'edit', 'delete', 'manage'].map((action) => [
      action,
      defaults[module]?.includes(action) ?? false,
    ]))
    return [module, { ...base, ...overrides[module] }]
  }))
}

export function hasPermission(user, module, action = 'view') {
  if (module === 'reportes' && user?.rol !== 'ADMINISTRADOR') return false
  if (module === 'configuracion' && user?.rol !== 'ADMINISTRADOR') return false
  return Boolean(getEffectivePermissions(user)[module]?.[action])
}

export function canAccessRoute(user, path) {
  const requirement = routeRequirements[path]
  if (path.startsWith('/reportes') && user?.rol !== 'ADMINISTRADOR') return false
  if (path.startsWith('/configuracion') && user?.rol !== 'ADMINISTRADOR') return false
  return requirement ? hasPermission(user, ...requirement) : false
}
