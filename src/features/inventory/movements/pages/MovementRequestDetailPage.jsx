import { ArrowLeft, CheckCircle2, Save, Send, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Badge } from '../../../../components/ui/Badge'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'
import { useCurrentUser } from '../../../auth/useCurrentUser'
import { usePermission } from '../../../auth/usePermission'
import { useProducts } from '../../../products/ProductContext'
import { MOVEMENT_REQUEST_STATUS, MOVEMENT_STATUS_TONES } from '../movementRequestRules'

export function MovementRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const canManage = usePermission('movimientos', 'manage')
  const { getMovementRequestById, submitMovementRequest, updateMovementRequest, approveMovementRequest, rejectMovementRequestById } = useProducts()
  const request = getMovementRequestById(id)
  const [error, setError] = useState('')
  const [reviewQuantity, setReviewQuantity] = useState(request?.quantity ?? '')
  const [reviewObservations, setReviewObservations] = useState(request?.observations ?? '')
  if (!request || (user.rol === 'CAJERA' && request.createdById !== user.id)) return <div className="movements-page"><PageHeader title="Movimiento no encontrado" /></div>

  function reject() {
    const reason = window.prompt('Indica el motivo obligatorio del rechazo:')
    if (!reason?.trim()) return
    try { rejectMovementRequestById(id, reason) } catch (caught) { setError(caught.message) }
  }

  return <div className="movements-page"><PageHeader title={request.id} description="Detalle y trazabilidad del movimiento." action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/inventario/movimientos')}>Volver</Button>} />
    {error && <p className="movement-form-error">{error}</p>}
    <div className="movement-detail-grid"><Card className="movement-detail-card"><div><small>Estado</small><Badge tone={MOVEMENT_STATUS_TONES[request.status]}>{MOVEMENT_REQUEST_STATUS[request.status]}</Badge></div><dl><div><dt>Tipo</dt><dd>{request.type}</dd></div><div><dt>Motivo</dt><dd>{request.reason}</dd></div><div><dt>Producto</dt><dd>{request.productName}</dd></div><div><dt>Cantidad</dt><dd>{request.quantity} {request.unit}</dd></div><div><dt>Registró</dt><dd>{request.createdByName}</dd></div><div><dt>Fecha</dt><dd>{request.date} · {request.time}</dd></div>{request.approvedByName && <div><dt>Aprobó</dt><dd>{request.approvedByName} · {request.approvedAt}</dd></div>}</dl>{request.observations && <p>{request.observations}</p>}{request.rejectionReason && <div className="request-rejection"><strong>Motivo de rechazo</strong><p>{request.rejectionReason}</p><small>{request.rejectedByName} · {request.rejectedAt}</small></div>}</Card>
      <Card className="movement-audit"><h2>Auditoría</h2>{request.audit.map((entry, index) => <div key={`${entry.at}-${index}`}><span /><p><strong>{entry.action.replaceAll('_', ' ')}</strong><small>{entry.userName} · {entry.at}</small>{entry.comment && <em>{entry.comment}</em>}</p></div>)}</Card></div>
    {canManage && request.status === 'PENDIENTE' && <Card className="movement-admin-review"><h2>Revisión administrativa</h2><div><label className="field"><span className="field__label">Cantidad</span><input type="number" min=".001" step=".001" value={reviewQuantity} onChange={(event) => setReviewQuantity(event.target.value)} /></label><label className="field"><span className="field__label">Observaciones</span><textarea rows="3" value={reviewObservations} onChange={(event) => setReviewObservations(event.target.value)} /></label></div><Button icon={Save} className="button--secondary" onClick={() => { try { updateMovementRequest(id, { quantity: reviewQuantity, observations: reviewObservations }) } catch (caught) { setError(caught.validationErrors?.quantity || caught.message) } }}>Guardar ajustes</Button></Card>}
    <div className="movement-detail-actions">{request.status === 'BORRADOR' && request.createdById === user.id && <Button icon={Send} onClick={() => submitMovementRequest(id)}>Enviar para aprobación</Button>}{canManage && request.status === 'PENDIENTE' && <><Button icon={XCircle} className="button--danger" onClick={reject}>Rechazar</Button><Button icon={CheckCircle2} onClick={() => { if (window.confirm('¿Aprobar y aplicar este movimiento?')) approveMovementRequest(id) }}>Aprobar y aplicar</Button></>}</div>
  </div>
}
