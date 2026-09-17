import { Plus, TriangleAlert } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../../components/ui/Button'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'
import { getDailySalesSummary, getSalesByDay } from '../../sales/saleRules'
import { DailySalesChart } from '../components/DailySalesChart'
import { MetricCard } from '../components/MetricCard'
import { StockAlertCard } from '../components/StockAlertCard'

export function DashboardPage() {
  const user = useCurrentUser()
  const navigate = useNavigate()
  const { products, sales, saleItems } = useProducts()
  const firstName = user.nombre.split(' ')[0]
  const stockAlerts = products.filter((product) => product.stockActual <= product.stockMinimo).slice(0, 2)
  const dailySales = getDailySalesSummary(sales, saleItems)
  const salesByDay = getSalesByDay(sales)
  const topProduct = saleItems.reduce((best, item) => {
    const quantity = saleItems.filter((entry) => entry.productoId === item.productoId).reduce((sum, entry) => sum + Number(entry.cantidad), 0)
    return !best || quantity > best.quantity ? { name: item.producto, quantity } : best
  }, null)
  const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

  return (
    <div className="dashboard-page">
      <div className={`dashboard-canvas${user.rol === 'CAJERA' ? ' dashboard-canvas--alerts-only' : ''}`}>
        {user.rol === 'CAJERA' && <section className="cashier-welcome-card">
          <div className="cashier-welcome-card__icon" aria-hidden="true">👋</div>
          <div className="cashier-welcome-card__content">
            <h1>Buenos días, {firstName} <span aria-hidden="true">👋</span></h1>
            <p>Te damos la bienvenida a Villa Dulce.</p>
            <div className="cashier-day-summary" aria-label="Resumen de la jornada">
              <span><i aria-hidden="true">🛒</i><strong>2</strong> ventas en espera.</span>
              <span><i aria-hidden="true">📦</i><strong>3</strong> productos con stock bajo.</span>
              <span><i aria-hidden="true">📝</i><strong>1</strong> solicitud pendiente de aprobación.</span>
            </div>
            <small>Que tengas una excelente jornada.</small>
          </div>
        </section>}

        {user.rol === 'ADMINISTRADOR' && <section className="dashboard-main">
          <div className="dashboard-welcome">
            <h1>¡Hola de nuevo, {firstName}! <span aria-hidden="true">👋</span></h1>
            <p>Aquí tienes el resumen de Villa Dulce para el día de hoy.</p>
          </div>

          <div className="operations-card">
            <div className="operations-card__glow" />
            <div className="operations-card__metrics">
              <MetricCard eyebrow="Ingresos del Día" value={currency.format(dailySales.revenue)} detail={`${dailySales.sales} ventas registradas`} tone="pink" />
              <MetricCard eyebrow="Productos Vendidos" value={dailySales.products} detail="Unidades vendidas hoy" tone="blue" />
              <MetricCard eyebrow="Producto más vendido" value={topProduct?.name ?? 'Sin ventas'} detail={topProduct ? `${topProduct.quantity} unidades` : 'Aún sin información'} tone="yellow" />
            </div>
            <DailySalesChart data={salesByDay} />
            <div className="operations-card__action">
              <Button icon={Plus} onClick={() => navigate('/ventas')}>Abrir Punto de Venta</Button>
              <p>{sales[0] ? `Última venta: ${sales[0].folio} a las ${sales[0].hora}` : 'Aún no hay ventas registradas'}</p>
            </div>
          </div>
        </section>}

        <aside className="stock-alerts">
          <div className="stock-alerts__header">
            <h2>Stock en alerta</h2>
            <TriangleAlert size={22} />
          </div>
          <div className="stock-alerts__list">
            {stockAlerts.map((product) => <StockAlertCard key={product.id} product={product} />)}
          </div>
        </aside>
      </div>
    </div>
  )
}
