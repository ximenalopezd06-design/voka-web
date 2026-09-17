import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, History } from 'lucide-react'
import { getMovementSummary } from '../movementRules'

const CARDS = [
  { key: 'entries', label: 'Entradas', icon: ArrowDownToLine, tone: 'green' },
  { key: 'exits', label: 'Salidas', icon: ArrowUpFromLine, tone: 'red' },
  { key: 'adjustments', label: 'Ajustes', icon: ArrowLeftRight, tone: 'yellow' },
  { key: 'total', label: 'Total movimientos', icon: History, tone: 'pink' },
]

export function MovementSummary({ movements }) {
  const summary = getMovementSummary(movements)

  return (
    <section className="movement-summary" aria-label="Resumen de movimientos">
      {CARDS.map(({ key, label, icon: Icon, tone }) => (
        <article key={key} className={`movement-summary-card movement-summary-card--${tone}`}>
          <span><Icon size={25} /></span>
          <div><p>{label}</p><strong>{summary[key]}</strong></div>
        </article>
      ))}
    </section>
  )
}
