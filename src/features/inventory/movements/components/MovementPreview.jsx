import { ArrowRight, PackageCheck } from 'lucide-react'
import { Badge } from '../../../../components/ui/Badge'
import { calculateMovementStock } from '../../services/inventoryMovementService'

const TYPE_LABELS = { ENTRADA: 'Entrada', SALIDA: 'Salida', AJUSTE: 'Ajuste' }

export function MovementPreview({ product, type, quantity, adjustmentDirection }) {
  const amount = Number(quantity)
  const validAmount = quantity !== '' && Number.isFinite(amount) && amount > 0
  const newStock = product && type && validAmount
    ? calculateMovementStock({ type, currentStock: product.stockActual, quantity: amount, adjustmentDirection })
    : null
  const signedAmount = type === 'SALIDA' || (type === 'AJUSTE' && adjustmentDirection === 'DECREASE')
    ? `−${validAmount ? amount : 0}`
    : `+${validAmount ? amount : 0}`

  return (
    <aside className="movement-preview">
      <div className="movement-preview__heading"><PackageCheck size={22} /><div><h2>Resumen del movimiento</h2><p>Vista previa antes de registrar.</p></div></div>
      {product ? (
        <>
          <div className="movement-preview__product">
            <strong>{product.nombre}</strong>
            <Badge tone={type === 'SALIDA' ? 'danger' : type === 'AJUSTE' ? 'warning' : 'success'}>{TYPE_LABELS[type] ?? 'Selecciona un tipo'}</Badge>
          </div>
          <div className="movement-preview__stock">
            <span><small>Stock actual</small><strong>{product.stockActual}</strong></span>
            <ArrowRight size={23} />
            <span className={newStock !== null && newStock < 0 ? 'movement-preview__invalid' : ''}><small>Nuevo stock</small><strong>{newStock ?? '—'}</strong></span>
          </div>
          <dl>
            <div><dt>Cantidad</dt><dd>{signedAmount} {product.unidadVenta}</dd></div>
            <div><dt>Unidad</dt><dd>{product.unidadVenta}</dd></div>
          </dl>
          {newStock !== null && newStock < 0 && <p className="movement-preview__error">El resultado no puede ser negativo.</p>}
        </>
      ) : (
        <div className="movement-preview__empty"><span>📦</span><p>Selecciona un producto para visualizar el cálculo.</p></div>
      )}
    </aside>
  )
}
