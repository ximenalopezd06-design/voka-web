import { BarChart3 } from 'lucide-react'

const money = (value) => new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
}).format(value)

export function DailySalesChart({ data }) {
  const maximum = Math.max(...data.map((item) => item.revenue), 1)
  const total = data.reduce((sum, item) => sum + item.revenue, 0)
  const transactions = data.reduce((sum, item) => sum + item.sales, 0)

  return (
    <section className="daily-sales-chart" aria-labelledby="daily-sales-chart-title">
      <header>
        <div className="daily-sales-chart__title">
          <span><BarChart3 size={20} /></span>
          <div>
            <h2 id="daily-sales-chart-title">Ventas por día</h2>
            <p>Comportamiento de los últimos siete días registrados.</p>
          </div>
        </div>
        <div className="daily-sales-chart__total">
          <small>Total del periodo</small>
          <strong>{money(total)}</strong>
          <span>{transactions} {transactions === 1 ? 'venta' : 'ventas'}</span>
        </div>
      </header>

      <div className="daily-sales-chart__plot" role="img" aria-label="Gráfica de barras de ingresos por día">
        {data.map((item) => {
          const height = item.revenue ? Math.max(12, item.revenue / maximum * 100) : 3
          return (
            <div className={`daily-sales-chart__column${item.isToday ? ' daily-sales-chart__column--today' : ''}`} key={item.date}>
              <div className="daily-sales-chart__value">
                <strong>{item.revenue ? money(item.revenue) : '$0'}</strong>
                <small>{item.sales} {item.sales === 1 ? 'venta' : 'ventas'}</small>
              </div>
              <div className="daily-sales-chart__track" title={`${item.date}: ${money(item.revenue)} · ${item.sales} ventas`}>
                <span style={{ height: `${height}%` }} />
              </div>
              <div className="daily-sales-chart__label"><strong>{item.label}</strong><small>{item.date.slice(8)}</small></div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
