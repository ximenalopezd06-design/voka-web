import { FilterX, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { PRODUCT_CATEGORIES } from '../productConstants'
import { filterProducts } from '../productFilters'
import { useProducts } from '../ProductContext'
import { ProductTable } from '../components/ProductTable'
import { usePermission } from '../../auth/usePermission'

export function ProductCatalogPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { products, toggleProductStatus } = useProducts()
  const canCreate = usePermission('catalogo', 'create')
  const canEdit = usePermission('catalogo', 'edit')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('TODAS')
  const [status, setStatus] = useState('TODOS')

  const filteredProducts = useMemo(
    () => filterProducts(products, { search, category, status }),
    [products, search, category, status],
  )

  function clearFilters() {
    setSearch('')
    setCategory('TODAS')
    setStatus('TODOS')
  }

  function confirmToggle(product) {
    const action = product.estado === 'ACTIVO' ? 'desactivar' : 'activar'
    if (window.confirm(`¿Deseas ${action} “${product.nombre}”?`)) {
      toggleProductStatus(product.id)
    }
  }

  return (
    <div className="catalog-page">
      {location.state?.message && <div className="catalog-toast" role="status">{location.state.message}</div>}
      <PageHeader
        title="Catálogo de Productos"
        description="Administra los productos disponibles en Villa Dulce."
        action={canCreate ? <Button icon={Plus} onClick={() => navigate('/catalogo/nuevo')}>Nuevo Producto</Button> : null}
      />

      <Card className="catalog-filters">
        <label className="catalog-filter catalog-filter--search">
          <span>Buscar</span>
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
            <option value="TODAS">Todas las categorías</option>
            {PRODUCT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="catalog-filter">
          <span>Estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="TODOS">Todos</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </label>
        <button className="clear-filters-button" type="button" onClick={clearFilters} aria-label="Limpiar filtros" title="Limpiar filtros">
          <FilterX size={22} />
        </button>
      </Card>

      <Card className="catalog-results">
        <ProductTable products={filteredProducts} onToggleStatus={confirmToggle} canEdit={canEdit} />
      </Card>
    </div>
  )
}
