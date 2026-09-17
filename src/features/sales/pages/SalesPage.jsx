import { Ban, Banknote, Clock3, FolderClock } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'
import { calculateSaleTotal } from '../saleRules'
import { PaymentModal } from '../components/PaymentModal'
import { PosCart } from '../components/PosCart'
import { PosCatalog } from '../components/PosCatalog'
import { SaleTicket } from '../components/SaleTicket'
import { HeldSalesDrawer } from '../components/HeldSalesDrawer'
import { HeldSaleItemsModal } from '../components/HeldSaleItemsModal'
import { CancelHeldSaleModal } from '../components/CancelHeldSaleModal'
import { ProductSaleDetailModal } from '../components/ProductSaleDetailModal'

function stepFor(product) {
  return ['Pieza', 'Paquete', 'Caja', 'Bolsa'].includes(product.unidadVenta) ? 1 : .001
}

export function SalesPage() {
  const user = useCurrentUser()
  const { products, heldSales, confirmSale, holdSale, resumeHeldSale, cancelHeldSale } = useProducts()
  const [items, setItems] = useState([])
  const [details, setDetails] = useState({ customer: '', discount: 0, observations: '' })
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [heldOpen, setHeldOpen] = useState(false)
  const [viewingHeld, setViewingHeld] = useState(null)
  const [cancelingHeld, setCancelingHeld] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [ticket, setTicket] = useState(null)
  const [ticketOpen, setTicketOpen] = useState(false)
  const total = Math.max(0, calculateSaleTotal(items) - Number(details.discount || 0))
  const visibleHeld = heldSales.filter((sale) => user.rol === 'ADMINISTRADOR' || sale.userId === user.id)

  function addProduct(product) {
    setNotice('')
    if (Number(product.stockActual) <= 0) {
      setNotice('Este producto está agotado y no puede agregarse a la venta.')
      return false
    }
    let quantity = stepFor(product)
    if (!['Pieza', 'Paquete', 'Caja', 'Bolsa'].includes(product.unidadVenta)) {
      const entered = window.prompt(`Cantidad de ${product.nombre} en ${product.unidadVenta}:`, product.unidadVenta === 'Kilogramo' ? '0.250' : String(quantity))
      if (entered === null) return false
      quantity = Number(entered)
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setNotice('Ingresa una cantidad válida.')
        return false
      }
    }
    const existing = items.find((item) => item.productoId === product.id)
    const nextQuantity = Number(existing?.cantidad || 0) + quantity
    if (nextQuantity > Number(product.stockActual)) {
      setNotice('No hay suficiente stock disponible.')
      return false
    }
    setItems((current) => {
      if (existing) return current.map((item) => item.productoId === product.id ? { ...item, cantidad: nextQuantity } : item)
      return [...current, { productoId: product.id, producto: product.nombre, cantidad: quantity, precioUnitario: product.precioVenta, step: stepFor(product) }]
    })
    return true
  }

  function focusSearch() {
    window.requestAnimationFrame(() => document.getElementById('posProductSearch')?.focus())
  }

  function addFromSearch(product) {
    if (!addProduct(product)) return
    setSearch('')
    setNotice(`${product.nombre} fue agregado al carrito.`)
    focusSearch()
  }

  function barcode(product) {
    if (!product) {
      setNotice('Producto no encontrado.')
      focusSearch()
      return
    }
    addFromSearch(product)
  }

  function quantity(product, value) {
    const next = value === '' ? '' : Number(value)
    if (next !== '' && (next <= 0 || next > Number(product.stockActual))) return setNotice('La cantidad no es válida para el stock disponible.')
    setNotice('')
    setItems((current) => current.map((item) => item.productoId === product.id ? { ...item, cantidad: next } : item))
  }

  function clearCart(message = 'Venta cancelada.') {
    if (items.length && !window.confirm('¿Deseas vaciar la venta actual?')) return
    setItems([])
    setDetails({ customer: '', discount: 0, observations: '' })
    setNotice(message)
  }

  function leaveOnHold() {
    if (!items.length) return setNotice('Agrega productos antes de dejar la venta en espera.')
    holdSale({ items, ...details }, user)
    setItems([])
    setDetails({ customer: '', discount: 0, observations: '' })
    setNotice('Venta guardada en espera. Puedes iniciar una nueva venta.')
  }

  function resume(id) {
    if (items.length && !window.confirm('La venta actual será reemplazada. ¿Deseas continuar?')) return
    const held = resumeHeldSale(id)
    setItems(held.items)
    setDetails({ customer: held.customer || '', discount: held.discount || 0, observations: held.observations || '' })
    setHeldOpen(false)
    setNotice(`Venta en espera #${held.number} recuperada.`)
  }

  function charge(method, paymentDetails) {
    const soldItems = items.map((item) => ({ ...item }))
    try {
      const sale = confirmSale({ items: soldItems, paymentMethod: method, paymentDetails, ...details }, user)
      setPaymentOpen(false)
      setItems([])
      setDetails({ customer: '', discount: 0, observations: '' })
      setTicket({ sale, items: soldItems })
      setTicketOpen(true)
      setNotice('')
    } catch (error) {
      setPaymentOpen(false)
      setNotice(error.validationErrors?.payment || error.validationErrors?.discount || error.validationErrors?.items || 'No fue posible registrar la venta.')
    }
  }

  function removeHeld(id) {
    cancelHeldSale(id)
    setCancelingHeld(null)
    setNotice('Venta en espera eliminada.')
  }

  return <div className="pos-page">
    <header className="pos-heading"><div><h1>Punto de Venta</h1><p>Atendiendo como <strong>{user.nombre}</strong></p></div><div className="pos-heading__actions"><span className={`pos-held-indicator${visibleHeld.length ? ' pos-held-indicator--active' : ''}`}><Clock3 size={16} />Ventas en espera: <strong>{visibleHeld.length}</strong></span><Button icon={FolderClock} className="button--secondary" onClick={() => setHeldOpen(true)}>Ventas en espera {visibleHeld.length ? `(${visibleHeld.length})` : ''}</Button><span className="pos-register-status"><i className="pos-status-dot" /> Caja activa</span></div></header>
    {notice && <div className="pos-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')}>×</button></div>}
    <div className="pos-layout">
      <PosCatalog products={products} search={search} onSearch={setSearch} onAdd={addFromSearch} onConsult={setSelectedProduct} onBarcode={barcode} />
      <PosCart items={items} products={products} details={details} onDetails={(field, value) => setDetails((current) => ({ ...current, [field]: value }))} onQuantity={quantity} onRemove={(id) => setItems((current) => current.filter((item) => item.productoId !== id))} />
    </div>
    <div className="pos-action-bar">
      <Button icon={Banknote} disabled={!items.length || total <= 0} onClick={() => setPaymentOpen(true)}>Cobrar</Button>
      <Button icon={FolderClock} className="button--warning" disabled={!items.length} onClick={leaveOnHold}>Dejar en espera</Button>
      <Button icon={Ban} className="button--danger" disabled={!items.length} onClick={() => clearCart('Venta cancelada.')}>Cancelar venta</Button>
    </div>
    <HeldSalesDrawer open={heldOpen} sales={visibleHeld} onClose={() => setHeldOpen(false)} onResume={resume} onView={setViewingHeld} onCancel={setCancelingHeld} />
    <HeldSaleItemsModal sale={viewingHeld} onClose={() => setViewingHeld(null)} />
    <CancelHeldSaleModal sale={cancelingHeld} onClose={() => setCancelingHeld(null)} onConfirm={removeHeld} />
    <ProductSaleDetailModal product={selectedProduct} onClose={() => { setSelectedProduct(null); focusSearch() }} />
    {paymentOpen && <PaymentModal total={total} onClose={() => setPaymentOpen(false)} onConfirm={charge} />}
    {ticket && ticketOpen && <SaleTicket sale={ticket.sale} items={ticket.items} onClose={() => setTicketOpen(false)} onNew={() => { setTicketOpen(false); setItems([]) }} />}
  </div>
}
