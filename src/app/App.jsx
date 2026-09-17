import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ComingSoonPage } from '../components/feedback/ComingSoonPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { useAuth } from '../features/auth/AuthContext'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { InventoryMovementsPage } from '../features/inventory/movements/pages/InventoryMovementsPage'
import { NewInventoryMovementPage } from '../features/inventory/movements/pages/NewInventoryMovementPage'
import { MovementRequestFormPage } from '../features/inventory/movements/pages/MovementRequestFormPage'
import { MovementApprovalsPage } from '../features/inventory/movements/pages/MovementApprovalsPage'
import { MovementRequestDetailPage } from '../features/inventory/movements/pages/MovementRequestDetailPage'
import { InventoryPage } from '../features/inventory/pages/InventoryPage'
import { StockAlertsPage } from '../features/inventory/pages/StockAlertsPage'
import { EditProductPage } from '../features/products/pages/EditProductPage'
import { NewProductPage } from '../features/products/pages/NewProductPage'
import { ProductCatalogPage } from '../features/products/pages/ProductCatalogPage'
import { NewPurchasePage } from '../features/purchases/pages/NewPurchasePage'
import { PurchaseRequestsPage } from '../features/purchases/pages/PurchaseRequestsPage'
import { PurchaseRequestFormPage } from '../features/purchases/pages/PurchaseRequestFormPage'
import { PurchaseRequestDetailPage } from '../features/purchases/pages/PurchaseRequestDetailPage'
import { PurchaseDraftsPage } from '../features/purchases/pages/PurchaseDraftsPage'
import { NewSalePage } from '../features/sales/pages/NewSalePage'
import { SalesPage } from '../features/sales/pages/SalesPage'
import { canAccessRoute } from '../utils/permissions'
import { SuppliersPage } from '../features/suppliers/pages/SuppliersPage'
import { SupplierFormPage } from '../features/suppliers/pages/SupplierFormPage'
import { SupplierDetailPage } from '../features/suppliers/pages/SupplierDetailPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'
import { ReportsPage } from '../features/reports/pages/ReportsPage'

function ProtectedPage({ path, children }) {
  const user = useCurrentUser()

  if (!user) return <Navigate to="/login" replace />
  if (!canAccessRoute(user, path)) {
    return <Navigate to="/dashboard" replace state={{ accessDenied: true }} />
  }

  return children
}

function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />
}

function HomeRedirect() {
  const { currentUser, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to="/dashboard" replace />
}

function ModulePage({ path, title }) {
  return (
    <ProtectedPage path={path}>
      <ComingSoonPage title={title} />
    </ProtectedPage>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthenticatedLayout />}>
        <Route index element={<HomeRedirect />} />
        <Route
          path="dashboard"
          element={
            <ProtectedPage path="/dashboard">
              <DashboardPage />
            </ProtectedPage>
          }
        />
        <Route path="empleados/*" element={<Navigate to="/configuracion" replace state={{ settingsSection: 'users' }} />} />
        <Route path="proveedores" element={<ProtectedPage path="/proveedores"><SuppliersPage /></ProtectedPage>} />
        <Route path="proveedores/nuevo" element={<ProtectedPage path="/proveedores/nuevo"><SupplierFormPage /></ProtectedPage>} />
        <Route path="proveedores/editar/:id" element={<ProtectedPage path="/proveedores/editar/:id"><SupplierFormPage /></ProtectedPage>} />
        <Route path="proveedores/:id" element={<ProtectedPage path="/proveedores/:id"><SupplierDetailPage /></ProtectedPage>} />
        <Route path="configuracion" element={<ProtectedPage path="/configuracion"><SettingsPage /></ProtectedPage>} />
        <Route path="reportes" element={<ProtectedPage path="/reportes"><ReportsPage /></ProtectedPage>} />
        <Route path="ventas" element={<ProtectedPage path="/ventas"><SalesPage /></ProtectedPage>} />
        <Route path="ventas/nueva" element={<ProtectedPage path="/ventas/nueva"><NewSalePage /></ProtectedPage>} />
        <Route path="compras" element={<ProtectedPage path="/compras"><PurchaseRequestsPage /></ProtectedPage>} />
        <Route path="compras/nueva" element={<ProtectedPage path="/compras/nueva"><NewPurchasePage /></ProtectedPage>} />
        <Route path="compras/solicitudes" element={<ProtectedPage path="/compras/solicitudes"><PurchaseRequestsPage /></ProtectedPage>} />
        <Route path="compras/borradores" element={<ProtectedPage path="/compras/borradores"><PurchaseDraftsPage /></ProtectedPage>} />
        <Route path="compras/nueva-solicitud" element={<ProtectedPage path="/compras/nueva-solicitud"><PurchaseRequestFormPage /></ProtectedPage>} />
        <Route path="compras/solicitudes/:id/editar" element={<ProtectedPage path="/compras/solicitudes/:id/editar"><PurchaseRequestFormPage /></ProtectedPage>} />
        <Route path="compras/solicitudes/:id" element={<ProtectedPage path="/compras/solicitudes/:id"><PurchaseRequestDetailPage /></ProtectedPage>} />
        <Route path="entradas" element={<ModulePage path="/entradas" title="Entradas" />} />
        <Route path="salidas" element={<ModulePage path="/salidas" title="Salidas" />} />
        <Route
          path="inventario"
          element={<ProtectedPage path="/inventario"><InventoryPage /></ProtectedPage>}
        />
        <Route
          path="inventario/movimientos"
          element={
            <ProtectedPage path="/inventario/movimientos">
              <InventoryMovementsPage />
            </ProtectedPage>
          }
        />
        <Route
          path="inventario/nuevo-movimiento"
          element={
            <ProtectedPage path="/inventario/nuevo-movimiento">
              <NewInventoryMovementPage />
            </ProtectedPage>
          }
        />
        <Route path="inventario/nueva-entrada" element={<ProtectedPage path="/inventario/nueva-entrada"><MovementRequestFormPage type="ENTRADA" /></ProtectedPage>} />
        <Route path="inventario/nueva-salida" element={<ProtectedPage path="/inventario/nueva-salida"><MovementRequestFormPage type="SALIDA" /></ProtectedPage>} />
        <Route path="inventario/ajustes" element={<ProtectedPage path="/inventario/ajustes"><MovementRequestFormPage type="AJUSTE" /></ProtectedPage>} />
        <Route path="inventario/conteos" element={<ModulePage path="/inventario/conteos" title="Conteos Físicos" />} />
        <Route path="inventario/aprobaciones" element={<ProtectedPage path="/inventario/aprobaciones"><MovementApprovalsPage /></ProtectedPage>} />
        <Route path="inventario/movimientos/:id" element={<ProtectedPage path="/inventario/movimientos/:id"><MovementRequestDetailPage /></ProtectedPage>} />
        <Route path="inventario/alertas" element={<ProtectedPage path="/inventario/alertas"><StockAlertsPage /></ProtectedPage>} />
        <Route
          path="catalogo"
          element={<ProtectedPage path="/catalogo"><ProductCatalogPage /></ProtectedPage>}
        />
        <Route
          path="catalogo/nuevo"
          element={<ProtectedPage path="/catalogo/nuevo"><NewProductPage /></ProtectedPage>}
        />
        <Route
          path="catalogo/editar/:id"
          element={<ProtectedPage path="/catalogo/editar/:id"><EditProductPage /></ProtectedPage>}
        />
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  )
}
