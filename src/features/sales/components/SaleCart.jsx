import { Minus, Plus, Trash2 } from 'lucide-react'
import { ProductImage } from '../../products/components/ProductImage'
import { calculateSaleItemSubtotal } from '../saleRules'

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function SaleCart({ items, products, errors, onQuantityChange, onRemove }) {
  const productsById = new Map(products.map((product) => [product.id, product]))
  if (!items.length) return <div className="sale-cart-empty"><span>🛒</span><h3>El carrito está vacío</h3><p>Busca un producto para comenzar.</p></div>

  return (
    <div className="sale-cart-list">
      {items.map((item) => {
        const product = productsById.get(item.productoId)
        const itemError = errors?.[item.productoId]
        return (
          <article key={item.productoId} className={itemError ? 'sale-cart-item sale-cart-item--error' : 'sale-cart-item'}>
            <ProductImage product={product} />
            <div className="sale-cart-item__product"><strong>{product.nombre}</strong><small>{currency(item.precioUnitario)} / {product.unidadVenta}</small>{itemError && <span>{itemError.cantidad ?? itemError.product}</span>}</div>
            <div className="sale-quantity-control">
              <button type="button" onClick={() => onQuantityChange(product, Number(item.cantidad) - item.step)} aria-label="Disminuir cantidad"><Minus size={15} /></button>
              <input type="number" min={item.step} step={item.step} max={product.stockActual} value={item.cantidad} onChange={(event) => onQuantityChange(product, event.target.value)} />
              <button type="button" onClick={() => onQuantityChange(product, Number(item.cantidad) + item.step)} aria-label="Aumentar cantidad"><Plus size={15} /></button>
            </div>
            <strong className="sale-cart-item__subtotal">{currency(calculateSaleItemSubtotal(item))}</strong>
            <button type="button" className="icon-button icon-button--danger" onClick={() => onRemove(product.id)} aria-label={`Eliminar ${product.nombre}`}><Trash2 size={17} /></button>
          </article>
        )
      })}
    </div>
  )
}
