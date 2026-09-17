import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ProductImage } from '../../products/components/ProductImage'

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function SaleProductSearch({ products, onAdd }) {
  const [search, setSearch] = useState('')
  const results = useMemo(() => {
    const query = normalize(search)
    if (!query) return []
    return products
      .filter((product) => product.estado === 'ACTIVO')
      .filter((product) => normalize(product.nombre).includes(query) || normalize(product.codigoBarras).includes(query))
      .slice(0, 8)
  }, [products, search])

  return (
    <div className="sale-product-search">
      <div className="catalog-filter__control"><Search size={23} /><input autoFocus type="search" value={search} placeholder="Buscar producto o escanear código..." onChange={(event) => setSearch(event.target.value)} /></div>
      {search && (
        <div className="sale-search-results">
          {results.length ? results.map((product) => (
            <button key={product.id} type="button" disabled={product.stockActual <= 0} onClick={() => { onAdd(product); setSearch('') }}>
              <ProductImage product={product} />
              <span><strong>{product.nombre}</strong><small>{product.categoria} · {product.unidadVenta}</small></span>
              <span><strong>{currency(product.precioVenta)}</strong><small>Stock: {product.stockActual}</small></span>
              <Plus size={20} />
            </button>
          )) : <p>No encontramos productos activos con esa búsqueda.</p>}
        </div>
      )}
    </div>
  )
}
