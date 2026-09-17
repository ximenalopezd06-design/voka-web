import { AlertTriangle, Archive, CheckCircle2, CircleAlert } from 'lucide-react'
import { getInventorySummary } from '../inventoryRules'

const SUMMARY_CARDS = [
  { key: 'total', label: 'Total productos', icon: Archive, tone: 'blue' },
  { key: 'available', label: 'Disponibles', icon: CheckCircle2, tone: 'green' },
  { key: 'low', label: 'Stock bajo', icon: AlertTriangle, tone: 'yellow' },
  { key: 'empty', label: 'Agotados', icon: CircleAlert, tone: 'red' },
]

export function InventorySummary({ products }) {
  const summary = getInventorySummary(products)

  return (
    <section className="inventory-summary" aria-label="Resumen de inventario">
      {SUMMARY_CARDS.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className={`inventory-summary-card inventory-summary-card--${tone}`}>
          <span className="inventory-summary-card__icon"><Icon size={25} /></span>
          <div><p>{label}</p><strong>{summary[key]}</strong></div>
        </article>
      ))}
    </section>
  )
}
