import { X } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { calculateSaleItemSubtotal } from '../saleRules'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)

export function HeldSaleItemsModal({ sale, onClose }) {
  if (!sale) return null
  return <div className="pos-modal-backdrop"><section className="held-sale-items-modal" role="dialog" aria-modal="true" aria-label={`Artículos de ${sale.folio}`}>
    <div className="pos-modal__heading"><div><h2>Artículos de {sale.folio}</h2><p>Consulta de solo lectura.</p></div><button type="button" onClick={onClose} aria-label="Cerrar"><X /></button></div>
    <div className="held-sale-items-table"><table><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>{sale.items.map((item) => <tr key={item.productoId}><td>{item.producto}</td><td>{item.cantidad}</td><td>{money(item.precioUnitario)}</td><td>{money(calculateSaleItemSubtotal(item))}</td></tr>)}</tbody></table></div>
    <div className="pos-modal__actions"><Button className="button--secondary" onClick={onClose}>Cerrar</Button></div>
  </section></div>
}
