import { CheckCircle2, Eye, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Badge } from '../../../../components/ui/Badge'
import { Card } from '../../../../components/ui/Card'
import { useProducts } from '../../../products/ProductContext'
import { MOVEMENT_REQUEST_STATUS, MOVEMENT_STATUS_TONES } from '../movementRequestRules'

export function MovementApprovalsPage() {
  const navigate = useNavigate()
  const { movementRequests, approveMovementRequest, rejectMovementRequestById } = useProducts()
  const pending = movementRequests.filter((request) => request.status === 'PENDIENTE')

  function reject(request) {
    const reason = window.prompt('Indica el motivo obligatorio del rechazo:')
    if (reason?.trim()) rejectMovementRequestById(request.id, reason)
  }

  return <div className="movements-page"><PageHeader title="Aprobaciones de Inventario" description="Revisa movimientos pendientes antes de modificar existencias." />
    <Card className="movement-results"><div className="movement-table-wrap"><table className="movement-table approval-table"><thead><tr><th>ID</th><th>Fecha</th><th>Usuario</th><th>Tipo</th><th>Producto</th><th>Cantidad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{pending.map((request) => <tr key={request.id}><td>{request.id}</td><td>{request.date}<small>{request.time}</small></td><td>{request.createdByName}</td><td>{request.type === 'ENTRADA' ? 'Entrada' : 'Salida'}</td><td>{request.productName}</td><td>{request.quantity} {request.unit}</td><td><Badge tone={MOVEMENT_STATUS_TONES[request.status]}>{MOVEMENT_REQUEST_STATUS[request.status]}</Badge></td><td><div className="product-actions"><button className="icon-button" onClick={() => navigate(`/inventario/movimientos/${request.id}`)} title="Ver detalle"><Eye size={17} /></button><button className="icon-button icon-button--success" onClick={() => { if (window.confirm('¿Aprobar y aplicar este movimiento al inventario?')) approveMovementRequest(request.id) }} title="Aprobar"><CheckCircle2 size={17} /></button><button className="icon-button icon-button--danger" onClick={() => reject(request)} title="Rechazar"><XCircle size={17} /></button></div></td></tr>)}</tbody></table>{!pending.length && <div className="catalog-empty"><span>✅</span><h2>Sin movimientos pendientes</h2><p>La bandeja de aprobación está al día.</p></div>}</div></Card>
  </div>
}
