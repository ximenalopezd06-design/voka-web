import { Printer, X } from 'lucide-react'
import { BrandLogo } from '../../../components/brand/BrandLogo'
import { Button } from '../../../components/ui/Button'
import { useSettings } from '../../settings/SettingsContext'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

export function SaleTicket({ sale, items, onClose, onNew }) {
  const { business } = useSettings()
  return <div className="pos-modal-backdrop"><section className="sale-ticket" role="dialog" aria-modal="true"><div className="sale-ticket__paper"><BrandLogo compact /><h2>{business.name}</h2><p>{business.address}</p><hr /><div><span>Folio</span><strong>{sale.folio}</strong></div><div><span>Fecha</span><strong>{sale.fecha} · {sale.hora}</strong></div><div><span>Cajero</span><strong>{sale.usuario}</strong></div><hr />{items.map((item) => <article key={item.productoId}><div><strong>{item.producto}</strong><span>{item.cantidad} × {money(item.precioUnitario)}</span></div><b>{money(Number(item.cantidad) * Number(item.precioUnitario))}</b></article>)}<hr /><div className="sale-ticket__total"><span>TOTAL</span><strong>{money(sale.total)}</strong></div><div><span>Método</span><strong>{sale.metodoPago}</strong></div><p className="sale-ticket__thanks">¡Gracias por tu compra!</p></div><div className="sale-ticket__actions"><Button icon={Printer} onClick={() => window.print()}>Imprimir ticket</Button><Button className="button--secondary" onClick={onNew}>Nueva venta</Button><button type="button" aria-label="Cerrar" onClick={onClose}><X /></button></div></section></div>
}
