import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../../../../components/ui/Badge'
import { ProductImage } from '../../../products/components/ProductImage'
import { getInventoryStatus, INVENTORY_STATUS } from '../../inventoryRules'

const STATUS_LABELS = {
  [INVENTORY_STATUS.AVAILABLE]: { label: 'Disponible', tone: 'success' },
  [INVENTORY_STATUS.LOW]: { label: 'Stock bajo', tone: 'warning' },
  [INVENTORY_STATUS.EMPTY]: { label: 'Agotado', tone: 'danger' },
}

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function ProductSelector({ products, selectedProduct, onSelect, error }) {
  const [search, setSearch] = useState('')
  const activeProducts = useMemo(() => {
    const query = normalize(search)
    return products
      .filter((product) => product.estado === 'ACTIVO')
      .filter((product) => !query
        || normalize(product.nombre).includes(query)
        || normalize(product.codigoBarras).includes(query))
      .slice(0, 6)
  }, [products, search])

  if (selectedProduct) {
    const inventoryStatus = STATUS_LABELS[getInventoryStatus(selectedProduct)]
    return (
      <div className="movement-selected-product">
        <ProductImage product={selectedProduct} size="large" />
        <div className="movement-selected-product__info">
          <div className="movement-selected-product__heading">
            <div>
              <strong>{selectedProduct.nombre}</strong>
              <small>{selectedProduct.categoria}</small>
            </div>
            <button type="button" className="icon-button" onClick={() => onSelect(null)} aria-label="Cambiar producto"><X size={17} /></button>
          </div>
          <div className="movement-selected-product__details">
            <span><small>Código de barras</small><strong>{selectedProduct.codigoBarras}</strong></span>
            <span><small>Stock actual</small><strong>{selectedProduct.stockActual} {selectedProduct.unidadVenta}</strong></span>
            <span><small>Stock mínimo</small><strong>{selectedProduct.stockMinimo} {selectedProduct.unidadVenta}</strong></span>
            <span><small>Estado</small><Badge tone={inventoryStatus.tone}>{inventoryStatus.label}</Badge></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="movement-product-selector">
      <div className={`catalog-filter__control${error ? ' field__control--error' : ''}`}>
        <Search size={21} />
        <input
          type="search"
          value={search}
          placeholder="Buscar por nombre o código de barras..."
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      {error && <small className="field__error">{error}</small>}
      <div className="movement-product-options">
        {activeProducts.length > 0 ? activeProducts.map((product) => (
          <button key={product.id} type="button" onClick={() => onSelect(product)}>
            <ProductImage product={product} />
            <span><strong>{product.nombre}</strong><small>{product.codigoBarras}</small></span>
            <span className="movement-product-option__stock">{product.stockActual} {product.unidadVenta}</span>
          </button>
        )) : (
          <p>No hay productos activos que coincidan con la búsqueda.</p>
        )}
      </div>
    </div>
  )
}
