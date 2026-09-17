import { ArrowLeft, CheckCircle2, ReceiptText, Save, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Select } from '../../../components/ui/Select'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'
import { PurchaseItemsTable } from '../components/PurchaseItemsTable'
import { PurchaseProductPicker } from '../components/PurchaseProductPicker'
import { calculatePurchaseTotal, validatePurchase } from '../purchaseRules'

function today() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function NewPurchasePage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { products, suppliers, confirmPurchase } = useProducts()
  const [supplierId, setSupplierId] = useState('')
  const [date, setDate] = useState(today())
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState([])
  const [errors, setErrors] = useState({})
  const [createdPurchase, setCreatedPurchase] = useState(null)
  const total = calculatePurchaseTotal(items)

  function addProduct(product) {
    setItems((current) => [...current, {
      productoId: product.id,
      nombreProducto: product.nombre,
      cantidad: 1,
      costoUnitario: product.costoCompra,
    }])
    setErrors((current) => ({ ...current, items: undefined }))
  }

  function updateItem(productId, field, value) {
    setItems((current) => current.map((item) => item.productoId === productId ? { ...item, [field]: value } : item))
    setErrors((current) => {
      const nextItemErrors = { ...(current.itemErrors ?? {}) }
      if (nextItemErrors[productId]) nextItemErrors[productId] = { ...nextItemErrors[productId], [field]: undefined }
      return { ...current, itemErrors: nextItemErrors }
    })
  }

  function submitPurchase(event) {
    event.preventDefault()
    const nextErrors = validatePurchase({ supplierId, date, items })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const purchase = confirmPurchase({ supplierId, date, notes, items }, user)
      setCreatedPurchase(purchase)
    } catch (error) {
      setErrors(error.validationErrors ?? { form: 'No fue posible registrar la compra.' })
    }
  }

  if (createdPurchase) {
    return (
      <div className="new-purchase-page">
        <PageHeader title="Compra registrada" description="La compra, el inventario y los movimientos se actualizaron correctamente." />
        <Card className="movement-success">
          <span className="movement-success__icon"><CheckCircle2 size={38} /></span>
          <h2>{createdPurchase.folio}</h2>
          <p>Compra completada por <strong>{currency(createdPurchase.total)}</strong>.</p>
          <div><Button onClick={() => navigate('/compras')}>Ver Compras</Button><Button className="button--secondary" onClick={() => navigate('/inventario')}>Ver Inventario</Button></div>
        </Card>
      </div>
    )
  }

  return (
    <div className="new-purchase-page">
      <PageHeader title="Nueva Compra" description="Registra la recepción de mercancía y actualiza automáticamente el inventario." action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/compras')}>Volver</Button>} />
      <form className="new-purchase-form" onSubmit={submitPurchase} noValidate>
        <Card className="new-purchase-section">
          <div className="form-section-heading"><ReceiptText size={21} /><div><h2>Información de la compra</h2><p>Selecciona el proveedor y la fecha de recepción.</p></div></div>
          <div className="new-purchase-meta">
            <Select id="purchaseSupplier" label="Proveedor *" value={supplierId} error={errors.supplierId} onChange={(event) => { setSupplierId(event.target.value); setErrors((current) => ({ ...current, supplierId: undefined })) }}>
              <option value="">Selecciona un proveedor</option>
              {suppliers.filter((supplier) => supplier.estado === 'ACTIVO').map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nombre}</option>)}
            </Select>
            <label className="field" htmlFor="purchaseDate"><span className="field__label">Fecha *</span><input id="purchaseDate" className={`field__control${errors.date ? ' field__control--error' : ''}`} type="date" value={date} onChange={(event) => { setDate(event.target.value); setErrors((current) => ({ ...current, date: undefined })) }} />{errors.date && <small className="field__error">{errors.date}</small>}</label>
          </div>
        </Card>

        <Card className="new-purchase-section">
          <div className="form-section-heading"><ReceiptText size={21} /><div><h2>Productos</h2><p>Agrega uno o varios productos y define sus cantidades y costos.</p></div></div>
          <PurchaseProductPicker products={products} selectedIds={items.map((item) => item.productoId)} onAdd={addProduct} />
          {errors.items && <p className="purchase-form-error">{errors.items}</p>}
          <PurchaseItemsTable items={items} products={products} errors={errors.itemErrors} onChange={updateItem} onRemove={(productId) => setItems((current) => current.filter((item) => item.productoId !== productId))} />
        </Card>

        <div className="new-purchase-bottom">
          <Card className="new-purchase-notes">
            <label className="field" htmlFor="purchaseNotes"><span className="field__label">Notas opcionales</span><textarea id="purchaseNotes" className="field__control" rows="4" maxLength="300" value={notes} placeholder="Información adicional sobre la compra..." onChange={(event) => setNotes(event.target.value)} /><small>{notes.length}/300</small></label>
          </Card>
          <Card className="purchase-total-card"><span>Total de la compra</span><strong>{currency(total)}</strong><small>{items.length} {items.length === 1 ? 'producto' : 'productos'}</small></Card>
        </div>
        {errors.form && <p className="purchase-form-error">{errors.form}</p>}
        <div className="product-form__actions"><Button type="button" icon={X} className="button--secondary" onClick={() => navigate('/compras')}>Cancelar</Button><Button type="submit" icon={Save}>Confirmar compra</Button></div>
      </form>
    </div>
  )
}
