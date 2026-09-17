import { BarChart3 } from 'lucide-react'
import { matchPath, useLocation } from 'react-router-dom'
import { routeMeta } from '../../app/routeMeta'
import { useProducts } from '../../features/products/ProductContext'
import { getDailySalesSummary } from '../../features/sales/saleRules'
import { NotificationCenter } from '../../features/settings/components/NotificationCenter'
import { useCurrentUser } from '../../features/auth/useCurrentUser'

export function Header() {
  const user = useCurrentUser()
  const { pathname } = useLocation()
  const { sales, saleItems } = useProducts()
  const dailySales = getDailySalesSummary(sales, saleItems)
  const currentRoute = routeMeta.find(({ pattern }) => matchPath({ path: pattern, end: true }, pathname))
  const isDashboard = pathname === '/dashboard'

  return (
    <header className="app-header">
      <h2>{currentRoute?.title ?? 'Villa Dulce'}</h2>
      <div className="app-header__actions">
        {isDashboard && user.rol === 'ADMINISTRADOR' && (
          <div className="daily-summary">
            <BarChart3 size={17} />
            <span>{dailySales.sales} {dailySales.sales === 1 ? 'venta' : 'ventas'} hoy</span>
            <i />
            <strong>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(dailySales.revenue)}</strong>
          </div>
        )}
        <NotificationCenter />
      </div>
    </header>
  )
}
