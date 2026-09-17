import { Trash2 } from 'lucide-react'
import { ProductImage } from '../../products/components/ProductImage'
import { calculatePurchaseItemSubtotal } from '../purchaseRules'

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function PurchaseItemsTable({ items, products, errors, onChange, onRemove }) {
  const productsById = new Map(products.map((product) => [product.id, product]))
  if (!items.length) {
    return <div className="purchase-items-empty"><span>🍭</span><p>Busca y agrega los productos de esta compra.</p></div>
  }

  return (
    <div className="purchase-items-wrap">
      <table className="purchase-items-table">
        <thead><tr><th>Producto</th><th>Unidad</th><th>Cantidad</th><th>Costo unitario</th><th>Subtotal</th><th /></tr></thead>
        <tbody>
          {items.map((item) => {
            const product = productsById.get(item.productoId)
            const itemErrors = errors?.[item.productoId] ?? {}
            return (
              <tr key={item.productoId}>
                <td><div className="purchase-item-product"><ProductImage product={product} /><span><strong>{product.nombre}</strong><small>Stock: {product.stockActual}</small></span></div></td>
                <td>{product.unidadVenta}</td>
                <td><input className={itemErrors.cantidad ? 'purchase-item-input purchase-item-input--error' : 'purchase-item-input'} type="number" min="0" step="0.001" value={item.cantidad} onChange={(event) => onChange(item.productoId, 'cantidad', event.target.value)} />{itemErrors.cantidad && <small className="field__error">{itemErrors.cantidad}</small>}</td>
                <td><div className={itemErrors.costoUnitario ? 'purchase-cost-input purchase-item-input--error' : 'purchase-cost-input'}><span>$</span><input type="number" min="0" step="0.01" value={item.costoUnitario} onChange={(event) => onChange(item.productoId, 'costoUnitario', event.target.value)} /></div>{itemErrors.costoUnitario && <small className="field__error">{itemErrors.costoUnitario}</small>}</td>
                <td className="purchase-item-subtotal">{currency(calculatePurchaseItemSubtotal(item))}</td>
                <td><button type="button" className="icon-button icon-button--danger" onClick={() => onRemove(item.productoId)} aria-label={`Eliminar ${product.nombre}`}><Trash2 size={17} /></button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
