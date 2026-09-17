import { FilterX, History, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PRODUCT_CATEGORIES } from '../../products/productConstants'
import { useProducts } from '../../products/ProductContext'
import { InventorySummary } from '../components/InventorySummary'
import { InventoryTable } from '../components/InventoryTable'
import { filterInventory, INVENTORY_STATUS } from '../inventoryRules'
import { usePermission } from '../../auth/usePermission'

export function InventoryPage() {
  const navigate = useNavigate()
  const { products } = useProducts()
  const canCreateMovement = usePermission('movimientos', 'create')
  const canViewMovements = usePermission('movimientos', 'view')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('TODAS')
  const [inventoryStatus, setInventoryStatus] = useState('TODOS')

  const filteredProducts = useMemo(
    () => filterInventory(products, { search, category, inventoryStatus }),
    [products, search, category, inventoryStatus],
  )

  function clearFilters() {
    setSearch('')
    setCategory('TODAS')
    setInventoryStatus('TODOS')
  }

  return (
    <div className="inventory-page">
      <PageHeader
        title="Inventario"
        description="Consulta las existencias actuales de los productos de Villa Dulce."
        action={
          (canViewMovements || canCreateMovement) ? <div className="page-header-actions">
            {canViewMovements && <Button icon={History} className="button--secondary" onClick={() => navigate('/inventario/movimientos')}>Ver movimientos</Button>}
            {canCreateMovement && <Button icon={Plus} onClick={() => navigate('/inventario/nueva-entrada')}>Nueva entrada</Button>}
          </div> : null
        }
      />

      <InventorySummary products={products} />

      <Card className="catalog-filters inventory-filters">
        <label className="catalog-filter catalog-filter--search">
          <span>Buscar producto</span>
          <div className="catalog-filter__control">
            <Search size={22} />
            <input
              type="search"
              value={search}
              placeholder="Nombre o código de barras..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </label>
        <label className="catalog-filter">
          <span>Categoría</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="TODAS">Todas</option>
            {PRODUCT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="catalog-filter">
          <span>Estado</span>
          <select value={inventoryStatus} onChange={(event) => setInventoryStatus(event.target.value)}>
            <option value="TODOS">Todos</option>
            <option value={INVENTORY_STATUS.AVAILABLE}>Disponible</option>
            <option value={INVENTORY_STATUS.LOW}>Stock bajo</option>
            <option value={INVENTORY_STATUS.EMPTY}>Agotado</option>
          </select>
        </label>
        <button className="clear-filters-button" type="button" onClick={clearFilters} aria-label="Limpiar filtros" title="Limpiar filtros">
          <FilterX size={22} />
        </button>
      </Card>

      <Card className="inventory-results">
        <InventoryTable products={filteredProducts} />
      </Card>
    </div>
  )
}
