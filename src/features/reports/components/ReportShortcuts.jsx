import { Boxes, ChartNoAxesCombined, PackageSearch, ShoppingCart, Users } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

const icons = { chart: ChartNoAxesCombined, inventory: Boxes, purchases: ShoppingCart, products: PackageSearch, employees: Users }

export function ReportShortcuts({ items, onOpen }) {
  return <section className="report-shortcuts"><div className="report-section-heading"><h2>Accesos rápidos</h2><p>Consulta reportes específicos por área.</p></div><div>{items.map((item) => {
    const Icon = icons[item.icon] || ChartNoAxesCombined
    return <article key={item.id}><span><Icon size={22} /></span><h3>{item.title}</h3><p>{item.description}</p><Button className="button--secondary" onClick={() => onOpen(item)}>Ver reporte</Button></article>
  })}</div></section>
}
