import { Eye, Plus, Search } from 'lucide-react'
import { useMemo } from 'react'
import { ProductImage } from '../../products/components/ProductImage'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function PosCatalog({ products, search, onSearch, onAdd, onConsult, onBarcode }) {
  const active = useMemo(() => products.filter((product) => product.estado === 'ACTIVO'), [products])
  const results = useMemo(() => {
    const query = normalize(search.trim())
    if (!query) return []
    return active.filter((product) => [product.nombre, product.codigoBarras, product.sku]
      .some((value) => normalize(value).includes(query))).slice(0, 8)
  }, [active, search])

  function keyDown(event) {
    if (event.key !== 'Enter' || !search.trim()) return
    event.preventDefault()
    const value = search.trim()
    const exact = active.find((product) => product.codigoBarras === value || product.sku === value)
    onBarcode(exact)
  }

  return <section className="pos-sales-search-workspace">
    <div className="pos-search pos-search--large"><Search size={23} /><input id="posProductSearch" autoFocus value={search} placeholder="Buscar por nombre, código de barras o SKU..." onChange={(event) => onSearch(event.target.value)} onKeyDown={keyDown} /></div>
    {search.trim() && <div className="pos-inline-results">
      {results.length ? results.map((product) => {
        const out = Number(product.stockActual) <= 0
        return <article key={product.id}>
          <ProductImage product={product} />
          <div><strong>{product.nombre}</strong><small>{product.codigoBarras}</small></div>
          <span><small>Existencias</small><strong className={out ? 'is-out' : ''}>{product.stockActual} {product.unidadVenta}</strong></span>
          <b>{money(product.precioVenta)}</b>
          <div className="pos-inline-result__actions">
            <button type="button" className="icon-button icon-button--success" disabled={out} title={out ? 'Producto agotado' : 'Agregar al carrito'} aria-label={`Agregar ${product.nombre}`} onClick={() => onAdd(product)}><Plus size={18} /></button>
            <button type="button" className="icon-button" title="Consultar información" aria-label={`Consultar ${product.nombre}`} onClick={() => onConsult(product)}><Eye size={18} /></button>
          </div>
        </article>
      }) : <div className="pos-inline-results__empty">No encontramos productos con esa búsqueda.</div>}
    </div>}
    {!search.trim() && <p className="pos-search-hint">Escribe para buscar o escanea un código de barras para agregar rápidamente.</p>}
  </section>
}
