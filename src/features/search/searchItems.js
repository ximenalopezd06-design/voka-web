import { BarChart3, BookOpen, Boxes, ClipboardList, FileEdit, LayoutDashboard, PackagePlus, Plus, ReceiptText, Settings, ShoppingBag, ShoppingCart, Truck } from 'lucide-react'

export const searchItems = [
  { label: 'Panel de control', description: 'Resumen general', path: '/dashboard', module: 'dashboard', action: 'view', group: 'General', icon: LayoutDashboard, keywords: 'dashboard inicio resumen' },
  { label: 'Ventas', description: 'Consultar ventas', path: '/ventas', module: 'ventas', action: 'view', group: 'Ventas', icon: ShoppingCart, keywords: 'venta historial' },
  { label: 'Punto de venta', description: 'Registrar y cobrar una venta', path: '/ventas', module: 'ventas', action: 'create', group: 'Ventas', icon: Plus, keywords: 'venta nueva cobrar caja pos' },
  { label: 'Compras', description: 'Consultar compras recibidas', path: '/compras', module: 'compras', action: 'view', group: 'Compras', icon: ShoppingBag, keywords: 'compra orden' },
  { label: 'Solicitudes de compra', description: 'Consultar solicitudes y aprobaciones', path: '/compras/solicitudes', module: 'compras', action: 'view', group: 'Compras', icon: ClipboardList, keywords: 'compra solicitud aprobar rechazo' },
  { label: 'Nueva solicitud de compra', description: 'Solicitar productos o insumos', path: '/compras/nueva-solicitud', module: 'compras', action: 'create', group: 'Compras', icon: ReceiptText, keywords: 'compra nueva solicitud insumo' },
  { label: 'Borradores de compra', description: 'Continuar solicitudes sin enviar', path: '/compras/borradores', module: 'compras', action: 'create', group: 'Compras', icon: FileEdit, keywords: 'compra borrador pendiente editar continuar' },
  { label: 'Inventario', description: 'Existencias actuales', path: '/inventario', module: 'inventario', action: 'view', group: 'Inventario', icon: Boxes, keywords: 'inventario stock existencia' },
  { label: 'Movimientos', description: 'Entradas, salidas y ajustes', path: '/inventario/movimientos', module: 'movimientos', action: 'view', group: 'Inventario', icon: ClipboardList, keywords: 'inventario movimiento entrada salida' },
  { label: 'Nueva entrada de inventario', description: 'Solicitar una entrada', path: '/inventario/nueva-entrada', module: 'movimientos', action: 'create', group: 'Inventario', icon: PackagePlus, keywords: 'inventario nuevo movimiento entrada recepción' },
  { label: 'Nueva salida de inventario', description: 'Solicitar una salida', path: '/inventario/nueva-salida', module: 'movimientos', action: 'create', group: 'Inventario', icon: PackagePlus, keywords: 'inventario nuevo movimiento salida daño' },
  { label: 'Ajustes de inventario', description: 'Crear una solicitud de ajuste', path: '/inventario/ajustes', module: 'movimientos', action: 'create', group: 'Inventario', icon: PackagePlus, keywords: 'inventario movimiento ajuste conteo' },
  { label: 'Catálogo de productos', description: 'Consultar productos', path: '/catalogo', module: 'catalogo', action: 'view', group: 'Catálogo', icon: BookOpen, keywords: 'producto catalogo' },
  { label: 'Nuevo producto', description: 'Registrar un producto', path: '/catalogo/nuevo', module: 'catalogo', action: 'create', group: 'Catálogo', icon: Plus, keywords: 'producto nuevo crear' },
  { label: 'Reportes', description: 'Indicadores y desempeño del negocio', path: '/reportes', module: 'reportes', action: 'view', group: 'Administración', icon: BarChart3, keywords: 'reporte ventas inventario compras desempeño kpi' },
  { label: 'Proveedores', description: 'Consultar proveedores', path: '/proveedores', module: 'proveedores', action: 'view', group: 'Administración', icon: Truck, keywords: 'proveedor contacto' },
  { label: 'Configuración', description: 'Administración del sistema y usuarios', path: '/configuracion', module: 'configuracion', action: 'view', group: 'Sistema', icon: Settings, keywords: 'ajustes usuarios permisos credenciales tema oscuro notificacion' },
]
