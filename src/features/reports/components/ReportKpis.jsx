import { AlertTriangle, ChartNoAxesCombined, ClipboardList, DollarSign, Package, ReceiptText, ShoppingCart, Users } from 'lucide-react'

const icons = { money: DollarSign, trend: ChartNoAxesCombined, cart: ShoppingCart, package: Package, receipt: ReceiptText, warning: AlertTriangle, clipboard: ClipboardList, users: Users }

export function ReportKpis({ items }) {
  return <section className="report-kpis" aria-label="Indicadores del periodo">{items.map((item) => {
    const Icon = icons[item.icon] || ChartNoAxesCombined
    return <article className={`report-kpi report-kpi--${item.tone}`} key={item.id}>
      <span><Icon size={21} /></span><div><small>{item.label}</small><strong>{item.value}</strong>{item.comparison && <p>{item.comparison}</p>}</div>
    </article>
  })}</section>
}
