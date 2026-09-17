import { Banknote, PackageCheck, ReceiptText } from 'lucide-react'
import { getDailySalesSummary } from '../saleRules'

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function SalesSummary({ sales, saleItems }) {
  const summary = getDailySalesSummary(sales, saleItems)
  const cards = [
    { label: 'Ventas del día', value: summary.sales, icon: ReceiptText, tone: 'pink' },
    { label: 'Total vendido hoy', value: currency(summary.revenue), icon: Banknote, tone: 'green' },
    { label: 'Productos vendidos', value: summary.products, icon: PackageCheck, tone: 'blue' },
  ]
  return (
    <section className="sales-summary">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className={`sales-summary-card sales-summary-card--${tone}`}>
          <span><Icon size={26} /></span><div><p>{label}</p><strong>{value}</strong></div>
        </article>
      ))}
    </section>
  )
}
