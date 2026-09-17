import { Minus, Plus, Trash2 } from 'lucide-react'
import { calculateSaleItemSubtotal, calculateSaleTotal } from '../saleRules'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

export function PosCart({ items, products, details, onDetails, onQuantity, onRemove }) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const subtotal = calculateSaleTotal(items)
  const total = Math.max(0, subtotal - Number(details.discount || 0))
  return <aside className="pos-cart">
    <div className="pos-cart__heading"><div><h2>Venta actual</h2><p>{items.length} conceptos</p></div><span>🛒</span></div>
    <div className="pos-cart__items">{items.length ? items.map((item) => { const product = productMap.get(item.productoId); return <article key={item.productoId}>
      <div className="pos-cart__product"><span>{product?.imagen || '🍬'}</span><div><strong>{item.producto}</strong><small>{money(item.precioUnitario)} / {product?.unidadVenta}</small></div><button type="button" onClick={() => onRemove(item.productoId)} aria-label="Eliminar"><Trash2 size={15} /></button></div>
      <div className="pos-cart__line"><div><button type="button" onClick={() => onQuantity(product, Number(item.cantidad) - item.step)}><Minus size={14} /></button><input type="number" step={item.step} min={item.step} value={item.cantidad} onChange={(event) => onQuantity(product, event.target.value)} /><button type="button" onClick={() => onQuantity(product, Number(item.cantidad) + item.step)}><Plus size={14} /></button></div><strong>{money(calculateSaleItemSubtotal(item))}</strong></div>
    </article> }) : <div className="pos-cart__empty"><span>🛍️</span><strong>Carrito vacío</strong><small>Selecciona productos para comenzar</small></div>}</div>
    <div className="pos-sale-details"><input value={details.customer} placeholder="Cliente (opcional)" onChange={(event) => onDetails('customer', event.target.value)} /><input type="number" min="0" max={subtotal} value={details.discount} placeholder="Descuento" onChange={(event) => onDetails('discount', event.target.value)} /><textarea rows="2" value={details.observations} placeholder="Observaciones" onChange={(event) => onDetails('observations', event.target.value)} /></div>
    <div className="pos-totals"><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Descuento</span><strong>{money(details.discount)}</strong></div><div><span>IVA</span><strong>{money(0)}</strong></div><div className="pos-totals__grand"><span>TOTAL</span><strong>{money(total)}</strong></div></div>
  </aside>
}
