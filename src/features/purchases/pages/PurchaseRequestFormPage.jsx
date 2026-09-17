import { ArrowLeft, Check, PackagePlus, Plus, Save, Send, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'
import { PurchaseProductPicker } from '../components/PurchaseProductPicker'
import { REQUEST_UNITS, calculateRequestTotal, validatePurchaseRequest } from '../requestRules'

const NOTES_LIMIT = 500
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)

function today() {
  const offset = new Date().getTimezoneOffset() * 60000
  return new Date(Date.now() - offset).toISOString().slice(0, 10)
}

function newCustomItem() {
  return { id: `draft-${Date.now().toString(36)}`, productId: null, name: '', description: '', quantity: 1, unit: 'Pieza', estimatedCost: 0, notes: '' }
}

export function PurchaseRequestFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { products, suppliers, purchaseRequests, createPurchaseRequest, getPurchaseRequestById, updatePurchaseRequest } = useProducts()
  const editingRequest = id ? getPurchaseRequestById(id) : null
  const canEditDraft = editingRequest?.status === 'BORRADOR' && (editingRequest.requesterId === user.id || user.rol === 'ADMINISTRADOR')
  const draftKey = `villa-dulce-purchase-draft-${user.id}`
  const storedDraft = useMemo(() => {
    if (editingRequest) return editingRequest
    try {
      return JSON.parse(localStorage.getItem(draftKey)) || {}
    } catch {
      return {}
    }
  }, [draftKey, editingRequest])
  const [providerId, setProviderId] = useState(storedDraft.providerId || '')
  const [date, setDate] = useState(storedDraft.date || today())
  const [priority, setPriority] = useState(storedDraft.priority || 'NORMAL')
  const [items, setItems] = useState(storedDraft.items || [])
  const [notes, setNotes] = useState(storedDraft.notes || '')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const activeSuppliers = suppliers.filter((supplier) => supplier.estado === 'ACTIVO')
  const selectedSupplier = activeSuppliers.find((supplier) => supplier.id === providerId)
  const productsById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products])
  const activeProducts = products.filter((product) => product.estado === 'ACTIVO')
  const nextNumber = editingRequest?.requestNumber || `SC-${new Date().getFullYear()}-${String(purchaseRequests.length + 1).padStart(4, '0')}`
  const estimatedTotal = calculateRequestTotal(items)
  const totalQuantity = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const informationComplete = Boolean(providerId)
  const productsComplete = items.length > 0 && items.every((item) => item.name.trim() && Number(item.quantity) > 0)
  const readyToSubmit = informationComplete && productsComplete

  useEffect(() => {
    if (editingRequest) return undefined
    const timer = window.setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ providerId, date, priority, items, notes }))
      setHasUnsavedChanges(false)
    }, 700)
    return () => window.clearTimeout(timer)
  }, [draftKey, providerId, date, priority, items, notes])

  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (!hasUnsavedChanges) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving)
  }, [hasUnsavedChanges])

  function markChanged() {
    setHasUnsavedChanges(true)
    setNotice('')
  }

  function addCatalogProduct(product) {
    if (!product || items.some((item) => item.productId === product.id)) return
    setItems((current) => [...current, {
      id: `draft-${product.id}`,
      productId: product.id,
      name: product.nombre,
      description: product.descripcion,
      quantity: 1,
      unit: product.unidadVenta,
      estimatedCost: Number(product.costoCompra || 0),
      notes: '',
    }])
    setErrors((current) => ({ ...current, items: undefined }))
    markChanged()
  }

  function addCustomItem() {
    setItems((current) => [...current, newCustomItem()])
    markChanged()
  }

  function updateItem(id, field, value) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item))
    setErrors((current) => ({ ...current, items: undefined }))
    markChanged()
  }

  function removeItem(id) {
    setItems((current) => current.filter((item) => item.id !== id))
    markChanged()
  }

  function saveDraft() {
    const data = { providerId, date, priority, items, notes }
    try {
      if (editingRequest) updatePurchaseRequest(editingRequest.id, data, false)
      else createPurchaseRequest(data, 'BORRADOR')
      localStorage.removeItem(draftKey)
      setProviderId('')
      setDate(today())
      setPriority('NORMAL')
      setItems([])
      setNotes('')
      setErrors({})
      setHasUnsavedChanges(false)
      setNotice('Solicitud guardada como borrador.')
      if (editingRequest) navigate('/compras/nueva-solicitud', { replace: true })
    } catch (error) {
      setErrors(error.validationErrors ?? { form: error.message })
    }
  }

  function leaveForm() {
    if (hasUnsavedChanges && !window.confirm('Hay cambios que todavía no se han guardado. ¿Deseas salir?')) return
    navigate('/compras')
  }

  function submit() {
    const data = { providerId, date, priority, items, notes }
    const nextErrors = validatePurchaseRequest(data)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const request = editingRequest
        ? (updatePurchaseRequest(editingRequest.id, data, true), editingRequest)
        : createPurchaseRequest(data, 'PENDIENTE')
      localStorage.removeItem(draftKey)
      setHasUnsavedChanges(false)
      navigate(`/compras/solicitudes/${request.id}`, { replace: true })
    } catch (error) {
      setErrors(error.validationErrors ?? { form: error.message })
    }
  }

  if (id && !canEditDraft) return <div className="purchase-request-form-page"><PageHeader title="Borrador no disponible" description="Esta solicitud no puede editarse." action={<Button icon={ArrowLeft} onClick={() => navigate('/compras')}>Volver</Button>} /></div>

  return (
    <div className="purchase-request-form-page purchase-request-create">
      <PageHeader
        title={editingRequest ? `Editar borrador ${editingRequest.requestNumber}` : 'Nueva solicitud de compra'}
        description={editingRequest ? 'Modifica la información guardada o envíala para aprobación.' : 'Solicita productos o insumos para revisión del administrador.'}
        action={<div className="request-create-header-actions"><Button icon={ArrowLeft} className="button--secondary" onClick={leaveForm}>Volver</Button><Button icon={Save} onClick={saveDraft}>Guardar borrador</Button></div>}
      />

      {notice && <div className="catalog-toast" role="status"><Check size={17} />{notice}</div>}

      <nav className="request-progress" aria-label="Progreso de la solicitud">
        <span className={informationComplete ? 'is-complete' : ''}>Información general {informationComplete && <Check size={14} />}</span>
        <span className={productsComplete ? 'is-complete' : ''}>Productos {productsComplete && <Check size={14} />}</span>
        <span className={notes.trim() ? 'is-complete' : ''}>Observaciones {notes.trim() && <Check size={14} />}</span>
        <span className={readyToSubmit ? 'is-complete' : ''}>Listo para enviar {readyToSubmit && <Check size={14} />}</span>
      </nav>

      <div className="request-create-layout">
        <main className="request-create-main">
          <Card className="request-create-card request-general-card">
            <div className="request-create-card__heading"><div><h2>Información general</h2><p>Datos principales de la solicitud de compra.</p></div></div>
            <div className="request-general-grid">
              <label className="field"><span className="field__label">Folio</span><input value={nextNumber} readOnly /></label>
              <label className="field"><span className="field__label">Fecha</span><input type="date" value={date} readOnly /></label>
              <label className="field"><span className="field__label">Solicitante</span><input value={user.nombre} readOnly /></label>
              <label className="field"><span className="field__label">Proveedor *</span><select value={providerId} onChange={(event) => { setProviderId(event.target.value); setErrors((current) => ({ ...current, providerId: undefined })); markChanged() }}><option value="">Seleccionar proveedor</option>{activeSuppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nombre}</option>)}</select>{errors.providerId && <small className="field__error">{errors.providerId}</small>}</label>
              <label className="field"><span className="field__label">Correo del proveedor</span><input value={selectedSupplier?.correo || 'Sin correo registrado'} readOnly /></label>
              <label className="field"><span className="field__label">Prioridad</span><select value={priority} onChange={(event) => { setPriority(event.target.value); markChanged() }}><option value="NORMAL">🟢 Normal</option><option value="URGENTE">🟡 Urgente</option><option value="CRITICA">🔴 Crítica</option></select></label>
            </div>
          </Card>

          <Card className="request-create-card request-products-card">
            <div className="request-create-card__heading request-products-heading"><div><h2>Productos solicitados</h2><p>Agrega productos del catálogo o captura un insumo libre.</p></div><Button type="button" icon={Plus} className="button--secondary" onClick={addCustomItem}>Agregar insumo libre</Button></div>
            <div className="request-product-search"><PurchaseProductPicker products={activeProducts} selectedIds={items.map((item) => item.productId).filter(Boolean)} onAdd={addCatalogProduct} /></div>
            {items.length ? <div className="request-create-table-wrap"><table className="request-create-table">
              <thead><tr><th>Producto</th><th>Código</th><th>Unidad</th><th>Existencia actual</th><th>Cantidad solicitada</th><th>Precio estimado</th><th>Importe</th><th>Acciones</th></tr></thead>
              <tbody>{items.map((item) => {
                const product = productsById.get(item.productId)
                return <tr key={item.id}>
                  <td><input aria-label="Producto" value={item.name} readOnly={Boolean(item.productId)} onChange={(event) => updateItem(item.id, 'name', event.target.value)} /></td>
                  <td>{product?.codigoBarras || 'S/C'}</td>
                  <td><select aria-label="Unidad" value={item.unit} onChange={(event) => updateItem(item.id, 'unit', event.target.value)}>{REQUEST_UNITS.map((unit) => <option key={unit}>{unit}</option>)}</select></td>
                  <td>{product ? `${product.stockActual} ${product.unidadVenta}` : '—'}</td>
                  <td><input aria-label="Cantidad solicitada" className={Number(item.quantity) <= 0 ? 'is-invalid' : ''} type="number" min="0.001" step="any" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', event.target.value)} /></td>
                  <td><input aria-label="Precio estimado" type="number" min="0" step="0.01" value={item.estimatedCost} onChange={(event) => updateItem(item.id, 'estimatedCost', event.target.value)} /></td>
                  <td><strong>{money(Number(item.quantity) * Number(item.estimatedCost))}</strong></td>
                  <td><button type="button" className="icon-button icon-button--danger" title="Eliminar producto" aria-label={`Eliminar ${item.name || 'insumo'}`} onClick={() => removeItem(item.id)}><Trash2 size={17} /></button></td>
                </tr>
              })}</tbody>
            </table></div> : <div className="request-create-empty"><span>🍭</span><h3>Aún no has agregado productos.</h3><p>Utiliza el buscador o agrega un insumo libre para comenzar.</p></div>}
            {errors.items && <p className="purchase-form-error">{errors.items}</p>}
          </Card>

          <Card className="request-create-card request-notes-card">
            <div className="request-create-card__heading"><div><h2>Observaciones</h2><p>Información adicional para quien revise la solicitud.</p></div></div>
            <label className="field"><textarea rows="4" maxLength={NOTES_LIMIT} value={notes} placeholder="Escribe observaciones o instrucciones adicionales para el administrador." onChange={(event) => { setNotes(event.target.value); markChanged() }} /><small className="request-notes-counter">{notes.length}/{NOTES_LIMIT}</small></label>
          </Card>
        </main>

        <aside>
          <Card className="request-create-summary">
            <div className="request-create-card__heading"><div><h2>Resumen</h2><p>Se actualiza automáticamente.</p></div></div>
            <dl>
              <div><dt>Productos agregados</dt><dd>{items.length}</dd></div>
              <div><dt>Cantidad total</dt><dd>{totalQuantity}</dd></div>
              <div><dt>Subtotal</dt><dd>{money(estimatedTotal)}</dd></div>
              <div><dt>IVA estimado</dt><dd>{money(0)}</dd></div>
              <div className="request-summary-total"><dt>Total estimado</dt><dd>{money(estimatedTotal)}</dd></div>
              <div><dt>Proveedor seleccionado</dt><dd>{selectedSupplier?.nombre || 'Sin seleccionar'}</dd></div>
              <div><dt>Estado de la solicitud</dt><dd><Badge tone="neutral">Borrador</Badge></dd></div>
            </dl>
            <div className="request-summary-tip"><PackagePlus size={18} /><span>{readyToSubmit ? 'La solicitud está lista para enviarse.' : 'Completa proveedor y productos para poder enviarla.'}</span></div>
          </Card>
        </aside>
      </div>

      {errors.form && <p className="purchase-form-error">{errors.form}</p>}
      <div className="request-create-actions">
        <Button className="button--secondary" onClick={leaveForm}>Cancelar</Button>
        <Button icon={Save} className="button--secondary" onClick={saveDraft}>Guardar borrador</Button>
        <Button icon={Send} onClick={submit}>Enviar para aprobación</Button>
      </div>
    </div>
  )
}
