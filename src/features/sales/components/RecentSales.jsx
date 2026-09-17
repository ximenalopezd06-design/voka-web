import { Badge } from '../../../components/ui/Badge'

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

const PAYMENT_LABELS = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }

export function RecentSales({ sales }) {
  return (
    <div className="recent-sales">
      <div className="recent-sales__heading"><h2>Ventas recientes</h2><p>Últimas operaciones registradas.</p></div>
      {sales.length ? (
        <div className="recent-sales__list">
          {sales.slice(0, 6).map((sale) => (
            <article key={sale.id}>
              <span className="recent-sale-folio">{sale.folio}</span>
              <div><strong>{sale.usuario}</strong><small>{sale.fecha} · {sale.hora}</small></div>
              <Badge tone="info">{PAYMENT_LABELS[sale.metodoPago]}</Badge>
              <strong>{currency(sale.total)}</strong>
            </article>
          ))}
        </div>
      ) : <div className="catalog-empty"><span>🧾</span><h2>Aún no hay ventas</h2><p>Registra la primera venta del día.</p></div>}
    </div>
  )
}
