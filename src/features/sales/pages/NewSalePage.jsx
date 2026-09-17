import { Banknote, CheckCircle2, CreditCard, Save, Send, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'
import { SaleCart } from '../components/SaleCart'
import { SaleProductSearch } from '../components/SaleProductSearch'
import { calculateSaleTotal, validateSale } from '../saleRules'

const PAYMENT_OPTIONS = [
  { value: 'EFECTIVO', label: 'Efectivo', icon: Banknote },
  { value: 'TARJETA', label: 'Tarjeta', icon: CreditCard },
  { value: 'TRANSFERENCIA', label: 'Transferencia', icon: Send },
]

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

function productStep(product) {
  return ['Pieza', 'Paquete'].includes(product.unidadVenta) ? 1 : 0.1
}

export function NewSalePage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { products, confirmSale } = useProducts()
  const [items, setItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [createdSale, setCreatedSale] = useState(null)
  const total = calculateSaleTotal(items)

  function addProduct(product) {
    setNotice('')
    setItems((current) => {
      const existing = current.find((item) => item.productoId === product.id)
      const step = productStep(product)
      if (existing) {
        const nextQuantity = Number(existing.cantidad) + step
        if (nextQuantity > Number(product.stockActual)) {
          setNotice('No hay suficiente stock disponible.')
          return current
        }
        return current.map((item) => item.productoId === product.id ? { ...item, cantidad: nextQuantity } : item)
      }
      if (Number(product.stockActual) < step) {
        setNotice('No hay suficiente stock disponible.')
        return current
      }
      return [...current, {
        productoId: product.id,
        producto: product.nombre,
        cantidad: step,
        precioUnitario: product.precioVenta,
        step,
      }]
    })
    setErrors((current) => ({ ...current, items: undefined }))
  }

  function changeQuantity(product, nextValue) {
    const quantity = nextValue === '' ? '' : Number(nextValue)
    if (quantity !== '' && quantity > Number(product.stockActual)) {
      setNotice('No hay suficiente stock disponible.')
      return
    }
    if (quantity !== '' && quantity <= 0) return
    setNotice('')
    setItems((current) => current.map((item) => item.productoId === product.id ? { ...item, cantidad: quantity } : item))
    setErrors((current) => {
      const itemErrors = { ...(current.itemErrors ?? {}) }
      delete itemErrors[product.id]
      return { ...current, itemErrors }
    })
  }

  function submitSale(event) {
    event.preventDefault()
    const nextErrors = validateSale({ items, paymentMethod, products })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const sale = confirmSale({ items, paymentMethod }, user)
      setItems([])
      setCreatedSale(sale)
    } catch (error) {
      setErrors(error.validationErrors ?? { form: 'No fue posible registrar la venta.' })
    }
  }

  if (createdSale) {
    return (
      <div className="new-sale-page">
        <PageHeader title="Venta registrada" description="El inventario y los movimientos se actualizaron correctamente." />
        <Card className="movement-success sale-success">
          <span className="movement-success__icon"><CheckCircle2 size={38} /></span>
          <h2>{createdSale.folio}</h2>
          <p>Venta registrada correctamente por <strong>{currency(createdSale.total)}</strong>.</p>
          <div><Button onClick={() => navigate('/ventas')}>Regresar a Ventas</Button><Button className="button--secondary" onClick={() => { setCreatedSale(null); setPaymentMethod('') }}>Nueva venta</Button></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="new-sale-page">
      <PageHeader title="Nueva Venta" description="Busca productos y completa el cobro." />
      <form className="new-sale-layout" onSubmit={submitSale} noValidate>
        <div className="new-sale-main">
          <Card className="sale-search-card">
            <div className="sale-section-heading"><h2>Buscar productos</h2><p>Busca por nombre o escanea el código de barras.</p></div>
            <SaleProductSearch products={products} onAdd={addProduct} />
            {notice && <p className="sale-stock-notice">{notice}</p>}
          </Card>
          <Card className="sale-cart-card">
            <div className="sale-section-heading"><h2>Detalle de la venta</h2><p>{items.length} {items.length === 1 ? 'producto agregado' : 'productos agregados'}</p></div>
            {errors.items && <p className="purchase-form-error">{errors.items}</p>}
            <SaleCart items={items} products={products} errors={errors.itemErrors} onQuantityChange={changeQuantity} onRemove={(productId) => setItems((current) => current.filter((item) => item.productoId !== productId))} />
          </Card>
        </div>

        <aside className="sale-checkout">
          <Card className="sale-payment-card">
            <div className="sale-section-heading"><h2>Método de pago</h2><p>Selecciona cómo se realizará el cobro.</p></div>
            <div className="payment-methods">
              {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <label key={value} className={paymentMethod === value ? 'payment-method payment-method--selected' : 'payment-method'}>
                  <input type="radio" name="paymentMethod" value={value} checked={paymentMethod === value} onChange={(event) => { setPaymentMethod(event.target.value); setErrors((current) => ({ ...current, paymentMethod: undefined })) }} />
                  <Icon size={21} /><span>{label}</span>
                </label>
              ))}
            </div>
            {errors.paymentMethod && <small className="field__error">{errors.paymentMethod}</small>}
          </Card>
          <Card className="sale-total-card">
            <div><span>Subtotal</span><strong>{currency(total)}</strong></div>
            <div className="sale-total-card__total"><span>Total</span><strong>{currency(total)}</strong></div>
            <small>Sin impuestos ni descuentos adicionales.</small>
          </Card>
          {errors.form && <p className="purchase-form-error">{errors.form}</p>}
          <div className="sale-checkout-actions">
            <Button type="button" icon={X} className="button--secondary" onClick={() => navigate('/ventas')}>Cancelar</Button>
            <Button type="submit" icon={Save}>Confirmar venta</Button>
          </div>
        </aside>
      </form>
    </div>
  )
}
