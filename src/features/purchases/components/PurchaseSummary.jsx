import { Ban, CheckCircle2, ReceiptText, WalletCards } from 'lucide-react'

export function PurchaseSummary({ purchases }) {
  const completed = purchases.filter((purchase) => purchase.estado === 'COMPLETADA')
  const total = completed.reduce((sum, purchase) => sum + purchase.total, 0)
  const cards = [
    { label: 'Total compras', value: purchases.length, icon: ReceiptText, tone: 'blue' },
    { label: 'Completadas', value: completed.length, icon: CheckCircle2, tone: 'green' },
    { label: 'Canceladas', value: purchases.length - completed.length, icon: Ban, tone: 'red' },
    { label: 'Inversión total', value: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(total), icon: WalletCards, tone: 'pink' },
  ]
  return (
    <section className="purchase-summary" aria-label="Resumen de compras">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article key={label} className={`purchase-summary-card purchase-summary-card--${tone}`}>
          <span><Icon size={24} /></span><div><p>{label}</p><strong>{value}</strong></div>
        </article>
      ))}
    </section>
  )
}
