import { Edit3, Power, PowerOff } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { ProductImage } from './ProductImage'

const UNIT_LABELS = {
  Pieza: 'pz',
  Gramo: 'g',
  Kilogramo: 'kg',
  Mililitro: 'ml',
  Litro: 'l',
  Paquete: 'paq',
}

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function ProductTable({ products, onToggleStatus, canEdit = true }) {
  if (products.length === 0) {
    return (
      <div className="catalog-empty">
        <span>🍬</span>
        <h2>No encontramos productos</h2>
        <p>Prueba con otra búsqueda o limpia los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="product-table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Unidad</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            {canEdit && <th className="product-table__actions-heading">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const active = product.estado === 'ACTIVO'
            return (
              <tr key={product.id} className={active ? '' : 'product-table__row--inactive'}>
                <td data-label="Producto">
                  <div className="product-cell">
                    <ProductImage product={product} />
                    <div>
                      <strong>{product.nombre}</strong>
                      <small>{product.codigoBarras}</small>
                    </div>
                  </div>
                </td>
                <td data-label="Categoría">{product.categoria}</td>
                <td data-label="Unidad">{product.unidadVenta}</td>
                <td data-label="Precio" className="product-table__price">
                  {currency(product.precioVenta)}<small>/{UNIT_LABELS[product.unidadVenta]}</small>
                </td>
                <td data-label="Stock">{product.stockActual} {UNIT_LABELS[product.unidadVenta]}</td>
                <td data-label="Estado">
                  <Badge tone={active ? 'info' : 'danger'}>{active ? 'Activo' : 'Inactivo'}</Badge>
                </td>
                {canEdit && <td data-label="Acciones">
                  <div className="product-actions">
                    <Link to={`/catalogo/editar/${product.id}`} className="icon-button" aria-label={`Editar ${product.nombre}`}>
                      <Edit3 size={18} />
                    </Link>
                    <button
                      type="button"
                      className={`icon-button${active ? ' icon-button--danger' : ' icon-button--success'}`}
                      aria-label={`${active ? 'Desactivar' : 'Activar'} ${product.nombre}`}
                      title={active ? 'Desactivar' : 'Activar'}
                      onClick={() => onToggleStatus(product)}
                    >
                      {active ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                  </div>
                </td>}
              </tr>
            )
          })}
        </tbody>
      </table>
      <footer className="product-table__footer">
        Mostrando {products.length} {products.length === 1 ? 'producto' : 'productos'}
      </footer>
    </div>
  )
}
