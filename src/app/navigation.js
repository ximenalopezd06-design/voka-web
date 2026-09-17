import {
  BookOpen,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Warehouse,
  Truck,
  Settings,
  BarChart3,
} from 'lucide-react'

export const navigationItems = [
  { label: 'Panel de Control', path: '/dashboard', icon: LayoutDashboard, module: 'dashboard', action: 'view' },
  { label: 'Ventas', path: '/ventas', icon: ShoppingCart, module: 'ventas', action: 'view' },
  { label: 'Compras', path: '/compras', icon: ShoppingBag, module: 'compras', action: 'view' },
  { label: 'Inventario', path: '/inventario', icon: Warehouse, module: 'inventario', action: 'view' },
  { label: 'Catálogo', path: '/catalogo', icon: BookOpen, module: 'catalogo', action: 'view' },
  { label: 'Proveedores', path: '/proveedores', icon: Truck, module: 'proveedores', action: 'view', section: 'Administración' },
  { label: 'Reportes', path: '/reportes', icon: BarChart3, module: 'reportes', action: 'view', section: 'Administración' },
  { label: 'Configuración', path: '/configuracion', icon: Settings, module: 'configuracion', action: 'view', section: 'Sistema' },
]
