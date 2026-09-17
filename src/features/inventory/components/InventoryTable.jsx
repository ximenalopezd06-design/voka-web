import { Badge } from '../../../components/ui/Badge'
import { ProductImage } from '../../products/components/ProductImage'
import { getInventoryStatus, INVENTORY_STATUS } from '../inventoryRules'

const UNIT_LABELS = {
  Pieza: 'piezas',
  Gramo: 'g',
  Kilogramo: 'kg',
  Mililitro: 'ml',
  Litro: 'l',
  Paquete: 'paquetes',
}

const STATUS_CONFIG = {
  [INVENTORY_STATUS.AVAILABLE]: { label: 'Disponible', tone: 'success' },
  [INVENTORY_STATUS.LOW]: { label: 'Stock bajo', tone: 'warning' },
  [INVENTORY_STATUS.EMPTY]: { label: 'Agotado', tone: 'danger' },
}

function capacityPercentage(product, status) {
  if (status === INVENTORY_STATUS.EMPTY) return 0
  const reference = Math.max(Number(product.stockMinimo) * 2, 1)
  return Math.min(100, Math.max(5, (Number(product.stockActual) / reference) * 100))
}

export function InventoryTable({ products }) {
  if (products.length === 0) {
    return (
      <div className="catalog-empty">
        <span>📦</span>
        <h2>No encontramos existencias</h2>
        <p>Prueba con otra búsqueda o limpia los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="inventory-table-wrap">
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock actual</th>
            <th>Stock mínimo</th>
            <th>Estado del inventario</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const status = getInventoryStatus(product)
            const config = STATUS_CONFIG[status]
            const unit = UNIT_LABELS[product.unidadVenta] ?? product.unidadVenta
            return (
              <tr key={product.id}>
                <td data-label="Imagen"><ProductImage product={product} /></td>
                <td data-label="Producto">
                  <div className="inventory-product-cell">
                    <strong>{product.nombre}</strong>
                    <small>Código: {product.codigoBarras}</small>
                  </div>
                </td>
                <td data-label="Categoría"><Badge tone="info">{product.categoria}</Badge></td>
                <td data-label="Stock actual" className={`inventory-stock inventory-stock--${status.toLowerCase()}`}>
                  {product.stockActual} <small>{unit}</small>
                </td>
                <td data-label="Stock mínimo">{product.stockMinimo} {unit}</td>
                <td data-label="Estado del inventario">
                  <div className="inventory-capacity">
                    <div className={`inventory-capacity__track inventory-capacity__track--${status.toLowerCase()}`}>
                      <span style={{ width: `${capacityPercentage(product, status)}%` }} />
                    </div>
                    <Badge tone={config.tone}>{config.label}</Badge>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <footer className="product-table__footer">Mostrando {products.length} {products.length === 1 ? 'producto' : 'productos'}</footer>
    </div>
  )
}
