import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from 'lucide-react'
import { Badge } from '../../../../components/ui/Badge'
import { ProductImage } from '../../../products/components/ProductImage'
import { MOVEMENT_REQUEST_STATUS, MOVEMENT_STATUS_TONES } from '../movementRequestRules'

const TYPE_CONFIG = {
  ENTRADA: { label: 'Entrada', tone: 'success', icon: ArrowDownToLine },
  SALIDA: { label: 'Salida', tone: 'danger', icon: ArrowUpFromLine },
  AJUSTE: { label: 'Ajuste', tone: 'warning', icon: ArrowLeftRight },
}

const UNIT_LABELS = {
  Pieza: 'piezas',
  Gramo: 'g',
  Kilogramo: 'kg',
  Mililitro: 'ml',
  Litro: 'l',
  Paquete: 'paquetes',
}

function formatDate(date) {
  const [year, month, day] = date.split('-')
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(Number(year), Number(month) - 1, Number(day)))
}

function signedQuantity(movement) {
  const quantity = Math.abs(movement.cantidad)
  if (movement.tipo === 'SALIDA') return `−${quantity}`
  if (movement.tipo === 'ENTRADA') return `+${quantity}`
  return `${movement.cantidad > 0 ? '+' : movement.cantidad < 0 ? '−' : ''}${Math.abs(movement.cantidad)}`
}

export function MovementTable({ movements, products }) {
  const productsById = new Map(products.map((product) => [product.id, product]))

  if (movements.length === 0) {
    return (
      <div className="catalog-empty">
        <span>🧾</span>
        <h2>No encontramos movimientos</h2>
        <p>Prueba con otro criterio o limpia los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="movement-table-wrap">
      <table className="movement-table">
        <thead>
          <tr>
            <th>Fecha y hora</th>
            <th>Producto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Motivo</th>
            <th>Registró / aprobó</th>
            <th>Referencia y Estado</th>
          </tr>
        </thead>
        <tbody>
          {movements.map((movement) => {
            const product = productsById.get(movement.productoId)
            const config = TYPE_CONFIG[movement.tipo]
            const TypeIcon = config.icon
            const unit = UNIT_LABELS[product?.unidadVenta] ?? product?.unidadVenta ?? ''
            return (
              <tr key={movement.id} title={movement.comentarios || undefined}>
                <td data-label="Fecha y hora">
                  <div className="movement-date"><strong>{formatDate(movement.fecha)}</strong><small>{movement.hora}</small></div>
                </td>
                <td data-label="Producto">
                  <div className="movement-product">
                    <ProductImage product={product ?? { nombre: movement.nombreProducto }} />
                    <div><strong>{movement.nombreProducto}</strong><small>{product?.codigoBarras ?? 'Sin código'}</small></div>
                  </div>
                </td>
                <td data-label="Tipo">
                  <Badge tone={config.tone} className="movement-type-badge"><TypeIcon size={14} />{config.label}</Badge>
                </td>
                <td data-label="Cantidad" className={`movement-quantity movement-quantity--${movement.tipo.toLowerCase()}`}>
                  {signedQuantity(movement)} <small>{unit}</small>
                </td>
                <td data-label="Motivo">{movement.motivo}</td>
                <td data-label="Usuarios"><div className="movement-users"><span><i>Registró</i>{movement.usuario}</span><span><i>Aprobó</i>{movement.approvedByName || 'Automático / no aplica'}</span></div></td>
                <td data-label="Referencia y Estado">
                  <div className="movement-reference-status">
                    <span>{movement.referencia || movement.folio || '—'}</span>
                    <Badge tone={MOVEMENT_STATUS_TONES[movement.estado] ?? 'info'}>{MOVEMENT_REQUEST_STATUS[movement.estado] ?? movement.estado}</Badge>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <footer className="product-table__footer">Mostrando {movements.length} {movements.length === 1 ? 'movimiento' : 'movimientos'}</footer>
    </div>
  )
}
