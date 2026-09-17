import { ArrowLeft, CheckCircle2, History, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'
import { Select } from '../../../../components/ui/Select'
import { useCurrentUser } from '../../../auth/useCurrentUser'
import { useProducts } from '../../../products/ProductContext'
import {
  getReasonsForMovementType,
  validateInventoryMovement,
} from '../../services/inventoryMovementService'
import { MovementPreview } from '../components/MovementPreview'
import { ProductSelector } from '../components/ProductSelector'

export function NewInventoryMovementPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { products, registerInventoryMovement } = useProducts()
  const [type, setType] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [adjustmentDirection, setAdjustmentDirection] = useState('INCREASE')
  const [errors, setErrors] = useState({})
  const [createdMovement, setCreatedMovement] = useState(null)
  const reasons = useMemo(() => getReasonsForMovementType(type), [type])

  function changeType(event) {
    setType(event.target.value)
    setReason('')
    setErrors((current) => ({ ...current, type: undefined, reason: undefined, quantity: undefined }))
  }

  function submitMovement(event) {
    event.preventDefault()
    const movementData = {
      productId: selectedProduct?.id,
      type,
      quantity,
      reason,
      comments,
      adjustmentDirection,
    }
    const nextErrors = validateInventoryMovement({
      product: selectedProduct,
      type,
      quantity,
      reason,
      adjustmentDirection,
    })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      const movement = registerInventoryMovement(movementData, user)
      setCreatedMovement(movement)
    } catch (error) {
      setErrors(error.validationErrors ?? { form: 'No fue posible registrar el movimiento.' })
    }
  }

  if (createdMovement) {
    return (
      <div className="new-movement-page">
        <PageHeader title="Movimiento registrado" description="El inventario y el historial se actualizaron correctamente." />
        <Card className="movement-success">
          <span className="movement-success__icon"><CheckCircle2 size={38} /></span>
          <h2>¡Movimiento guardado!</h2>
          <p>{createdMovement.nombreProducto} ahora tiene un stock de <strong>{createdMovement.stockResultante}</strong>.</p>
          <div>
            <Button onClick={() => navigate('/inventario')}>Regresar al Inventario</Button>
            <Button icon={History} className="button--secondary" onClick={() => navigate('/inventario/movimientos')}>Consultar Historial</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="new-movement-page">
      <PageHeader
        title="Nuevo Movimiento"
        description="Registra una entrada, salida o ajuste de inventario."
        action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/inventario')}>Volver</Button>}
      />
      <form className="new-movement-layout" onSubmit={submitMovement} noValidate>
        <Card className="new-movement-form">
          <div className="form-section-heading"><Save size={21} /><div><h2>Información del movimiento</h2><p>Completa los datos para actualizar las existencias.</p></div></div>
          <div className="new-movement-form__grid">
            <Select id="movementType" label="Tipo de movimiento *" value={type} error={errors.type} onChange={changeType}>
              <option value="">Selecciona un tipo</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
            </Select>
            {type === 'AJUSTE' && (
              <Select id="adjustmentDirection" label="Dirección del ajuste *" value={adjustmentDirection} onChange={(event) => setAdjustmentDirection(event.target.value)}>
                <option value="INCREASE">Aumentar stock (+)</option>
                <option value="DECREASE">Disminuir stock (−)</option>
              </Select>
            )}
          </div>

          <div className="new-movement-form__block">
            <span className="field__label">Producto *</span>
            <ProductSelector
              products={products}
              selectedProduct={selectedProduct}
              error={errors.productId}
              onSelect={(product) => {
                setSelectedProduct(product)
                setErrors((current) => ({ ...current, productId: undefined, quantity: undefined }))
              }}
            />
          </div>

          <div className="new-movement-form__grid">
            <label className="field" htmlFor="movementQuantity">
              <span className="field__label">Cantidad *</span>
              <div className={`movement-quantity-input${errors.quantity ? ' movement-quantity-input--error' : ''}`}>
                <input
                  id="movementQuantity"
                  type="number"
                  min="0"
                  step="0.001"
                  value={quantity}
                  placeholder="0"
                  onChange={(event) => {
                    setQuantity(event.target.value)
                    setErrors((current) => ({ ...current, quantity: undefined }))
                  }}
                />
                <span>{selectedProduct?.unidadVenta ?? 'Unidad'}</span>
              </div>
              {errors.quantity && <small className="field__error">{errors.quantity}</small>}
            </label>
            <Select id="movementReason" label="Motivo *" value={reason} error={errors.reason} disabled={!type} onChange={(event) => {
              setReason(event.target.value)
              setErrors((current) => ({ ...current, reason: undefined }))
            }}>
              <option value="">{type ? 'Selecciona un motivo' : 'Selecciona primero el tipo'}</option>
              {reasons.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </div>

          <label className="field new-movement-comments" htmlFor="movementComments">
            <span className="field__label">Comentarios opcionales</span>
            <textarea id="movementComments" className="field__control" rows="4" value={comments} maxLength="300" placeholder="Agrega información útil sobre este movimiento..." onChange={(event) => setComments(event.target.value)} />
            <small>{comments.length}/300</small>
          </label>
          {errors.form && <p className="movement-form-error">{errors.form}</p>}
        </Card>

        <div className="new-movement-sidebar">
          <Card><MovementPreview product={selectedProduct} type={type} quantity={quantity} adjustmentDirection={adjustmentDirection} /></Card>
          <div className="new-movement-actions">
            <Button type="button" icon={X} className="button--secondary" onClick={() => navigate('/inventario')}>Cancelar</Button>
            <Button type="submit" icon={Save}>Registrar movimiento</Button>
          </div>
        </div>
      </form>
    </div>
  )
}
