import { Eye, Play, Trash2, X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { calculateSaleTotal } from '../saleRules'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)
const time = (value = '') => {
  const parsed = new Date(value.replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(parsed)
}

export function HeldSalesDrawer({ open, sales, onClose, onResume, onView, onCancel }) {
  if (!open) return null
  return <div className="held-sales-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className="held-sales-drawer" role="dialog" aria-modal="true" aria-label="Ventas en espera">
      <header><div><small>Punto de venta</small><h2>Ventas en espera</h2><p>{sales.length} ventas guardadas temporalmente</p></div><button type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button></header>
      <div className="held-sales-list">{sales.length ? sales.map((sale) => {
        const articles = sale.items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)
        const total = Math.max(0, calculateSaleTotal(sale.items) - Number(sale.discount || 0))
        return <article key={sale.id}>
          <div className="held-sale-card__heading"><strong>{sale.folio || `VE-${String(sale.number).padStart(4, '0')}`}</strong><span>{time(sale.createdAt)}</span></div>
          <dl><div><dt>Cajera</dt><dd>{sale.userName}</dd></div><div><dt>Cliente</dt><dd>{sale.customer || 'Público general'}</dd></div><div><dt>Artículos</dt><dd>{articles}</dd></div><div><dt>Total estimado</dt><dd>{money(total)}</dd></div></dl>
          <div className="held-sale-card__actions">
            <Button icon={Play} onClick={() => onResume(sale.id)}>Continuar venta</Button>
            <Button icon={Eye} className="button--secondary" onClick={() => onView(sale)}>Ver artículos</Button>
            <button type="button" className="icon-button icon-button--danger" title="Cancelar venta" aria-label={`Cancelar ${sale.folio}`} onClick={() => onCancel(sale)}><Trash2 size={17} /></button>
          </div>
        </article>
      }) : <div className="held-sales-empty"><span>🗂️</span><strong>No hay ventas en espera</strong><p>Las ventas que dejes en espera aparecerán aquí.</p></div>}</div>
      <footer><Button className="button--secondary" onClick={onClose}>Cerrar</Button></footer>
    </aside>
  </div>
}
