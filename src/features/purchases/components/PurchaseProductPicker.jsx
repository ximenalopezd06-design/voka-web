import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ProductImage } from '../../products/components/ProductImage'

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function PurchaseProductPicker({ products, selectedIds, onAdd }) {
  const [search, setSearch] = useState('')
  const options = useMemo(() => {
    const query = normalize(search)
    return products
      .filter((product) => product.estado === 'ACTIVO' && !selectedIds.includes(product.id))
      .filter((product) => !query || normalize(product.nombre).includes(query) || normalize(product.codigoBarras).includes(query))
      .slice(0, 5)
  }, [products, selectedIds, search])

  return (
    <div className="purchase-product-picker">
      <div className="catalog-filter__control"><Search size={21} /><input type="search" value={search} placeholder="Buscar producto por nombre o código..." onChange={(event) => setSearch(event.target.value)} /></div>
      {search && (
        <div className="purchase-product-picker__options">
          {options.length ? options.map((product) => (
            <button key={product.id} type="button" onClick={() => { onAdd(product); setSearch('') }}>
              <ProductImage product={product} />
              <span><strong>{product.nombre}</strong><small>{product.categoria} · Stock: {product.stockActual} {product.unidadVenta}</small></span>
              <span><small>Costo actual</small><strong>${product.costoCompra}</strong></span>
              <Plus size={18} />
            </button>
          )) : <p>No hay productos activos disponibles para agregar.</p>}
        </div>
      )}
    </div>
  )
}
