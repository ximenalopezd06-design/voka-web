import { TriangleAlert } from 'lucide-react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Card } from '../../../components/ui/Card'
import { useProducts } from '../../products/ProductContext'
import { InventoryTable } from '../components/InventoryTable'

export function StockAlertsPage() {
  const { products } = useProducts()
  const alerts = products.filter((product) => Number(product.stockActual) <= Number(product.stockMinimo))
  return <div className="inventory-page"><PageHeader title="Alertas de Stock" description="Productos agotados o por debajo de su existencia mínima." action={<span className="stock-alert-page-count"><TriangleAlert size={18} />{alerts.length} alertas</span>} /><Card className="inventory-results"><InventoryTable products={alerts} /></Card></div>
}
