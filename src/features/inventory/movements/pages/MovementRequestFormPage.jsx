import { ArrowLeft, FileUp, Save, Send } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'
import { Select } from '../../../../components/ui/Select'
import { useProducts } from '../../../products/ProductContext'
import { ProductSelector } from '../components/ProductSelector'
import { ENTRY_REASONS, EXIT_REASONS, validateMovementRequest } from '../movementRequestRules'

export function MovementRequestFormPage({ type }) {
  const navigate = useNavigate()
  const { products, suppliers, purchaseRequests, createMovementRequest } = useProducts()
  const [product, setProduct] = useState(null)
  const [reason, setReason] = useState('')
  const [providerId, setProviderId] = useState('')
  const [orderRequestId, setOrderRequestId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [observations, setObservations] = useState('')
  const [evidence, setEvidence] = useState([])
  const [errors, setErrors] = useState({})
  const entry = type === 'ENTRADA'
  const adjustment = type === 'AJUSTE'
  const reasons = adjustment ? ['Ajuste positivo', 'Ajuste negativo'] : entry ? ENTRY_REASONS : EXIT_REASONS

  function save(status) {
    const effectiveType = adjustment && reason === 'Ajuste negativo' ? 'SALIDA' : adjustment ? 'ENTRADA' : type
    const order = purchaseRequests.find((request) => request.id === orderRequestId)
    const data = { type: effectiveType, reason, providerId: order?.providerId || providerId, orderRequestId, reference: order?.order?.orderNumber, productId: product?.id, quantity, observations, evidence }
    const nextErrors = validateMovementRequest(data, product)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const request = createMovementRequest(data, status)
      navigate(`/inventario/movimientos/${request.id}`, { replace: true })
    } catch (caught) {
      setErrors(caught.validationErrors ?? { form: caught.message })
    }
  }

  return <div className="new-movement-page">
    <PageHeader title={adjustment ? 'Ajuste de Inventario' : entry ? 'Nueva Entrada' : 'Nueva Salida'} description="El movimiento no cambiará existencias hasta que sea aprobado." action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/inventario')}>Volver</Button>} />
    <div className="movement-request-layout">
      <Card className="movement-request-form">
        <div className="form-section-heading"><Save size={21} /><div><h2>Información del movimiento</h2><p>Todos los campos quedarán registrados para auditoría.</p></div></div>
        <div className="new-movement-form__grid">
          <Select label={adjustment ? 'Tipo de ajuste *' : entry ? 'Tipo de entrada *' : 'Tipo de salida *'} value={reason} error={errors.reason} onChange={(event) => { setReason(event.target.value); setErrors({}) }}><option value="">Selecciona un motivo</option>{reasons.map((item) => <option key={item}>{item}</option>)}</Select>
          {entry && !adjustment && <Select label="Proveedor (si aplica)" value={providerId} onChange={(event) => setProviderId(event.target.value)}><option value="">Sin proveedor</option>{suppliers.filter((supplier) => supplier.estado === 'ACTIVO').map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nombre}</option>)}</Select>}
          {reason === 'Recepción de compra' && <Select label="Orden de compra *" value={orderRequestId} error={errors.orderRequestId} onChange={(event) => { setOrderRequestId(event.target.value); setErrors((current) => ({ ...current, orderRequestId: undefined })) }}><option value="">Selecciona una orden aceptada</option>{purchaseRequests.filter((request) => request.status === 'APROBADA' && request.order).map((request) => <option key={request.id} value={request.id}>{request.order.orderNumber} · {request.providerName}</option>)}</Select>}
        </div>
        <div className="new-movement-form__block"><span className="field__label">Producto *</span><ProductSelector products={products} selectedProduct={product} error={errors.productId} onSelect={setProduct} /></div>
        <label className="field"><span className="field__label">Cantidad *</span><div className={`movement-quantity-input${errors.quantity ? ' movement-quantity-input--error' : ''}`}><input type="number" min=".001" step=".001" value={quantity} onChange={(event) => { setQuantity(event.target.value); setErrors((current) => ({ ...current, quantity: undefined })) }} /><span>{product?.unidadVenta ?? 'Unidad'}</span></div>{errors.quantity && <small className="field__error">{errors.quantity}</small>}</label>
        <label className="field new-movement-comments"><span className="field__label">Observaciones</span><textarea rows="4" value={observations} maxLength="500" onChange={(event) => setObservations(event.target.value)} /><small>{observations.length}/500</small></label>
        <label className="movement-evidence"><FileUp size={21} /><span><strong>Adjuntar evidencia</strong><small>Se guardan nombres y tipo; preparada para almacenamiento de archivos.</small></span><input type="file" multiple accept="image/*,.pdf" onChange={(event) => setEvidence([...event.target.files].map((file) => ({ name: file.name, type: file.type, size: file.size })))} /></label>
        {evidence.length > 0 && <div className="movement-evidence-list">{evidence.map((file) => <span key={file.name}>{file.name}</span>)}</div>}
        {errors.form && <p className="movement-form-error">{errors.form}</p>}
      </Card>
      <div className="movement-request-actions"><Button icon={Save} className="button--secondary" onClick={() => save('BORRADOR')}>Guardar borrador</Button><Button icon={Send} onClick={() => save('PENDIENTE')}>Enviar para aprobación</Button></div>
    </div>
  </div>
}
