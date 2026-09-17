import { ArrowLeft, CheckCircle2, FileText, Mail, PackageCheck, Save, Send, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BrandLogo } from '../../../components/brand/BrandLogo'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { usePermission } from '../../auth/usePermission'
import { useProducts } from '../../products/ProductContext'
import { REQUEST_STATUSES, REQUEST_STATUS_TONES } from '../requestRules'

export function PurchaseRequestDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useCurrentUser()
  const canManage = usePermission('compras', 'manage')
  const { suppliers, getPurchaseRequestById, updatePurchaseRequest, cancelPurchaseRequest, approveRequest, rejectRequest, prepareRequestEmail, receiveRequest } = useProducts()
  const request = getPurchaseRequestById(id)
  const [rejectionReason, setRejectionReason] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [quantities, setQuantities] = useState(() => Object.fromEntries((request?.items ?? []).filter((item) => item.productId).map((item) => [item.id, item.quantity])))
  const [reviewProviderId, setReviewProviderId] = useState(request?.providerId ?? '')
  const [reviewItems, setReviewItems] = useState(request?.items ?? [])

  if (!request || (user.rol === 'CAJERA' && request.requesterId !== user.id)) return <div className="purchase-requests-page"><PageHeader title="Solicitud no encontrada" /></div>

  function act(callback, success) {
    try {
      callback()
      setMessage(success)
      setError('')
    } catch (caught) {
      setError(caught.message)
    }
  }

  return (
    <div className="purchase-request-detail-page">
      <PageHeader title={request.requestNumber} description={`Solicitud creada por ${request.requesterName}`} action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/compras/solicitudes')}>Volver</Button>} />
      {message && <div className="catalog-toast" role="status">{message}</div>}
      {error && <p className="purchase-form-error">{error}</p>}
      <div className="request-detail-grid">
        <Card className="request-detail-card">
          <div className="request-detail-heading"><div><small>Estado actual</small><Badge tone={REQUEST_STATUS_TONES[request.status]}>{REQUEST_STATUSES[request.status]}</Badge></div></div>
          <dl><div><dt>Fecha</dt><dd>{request.date}</dd></div><div><dt>Proveedor</dt><dd>{request.providerName}</dd></div><div><dt>Correo</dt><dd>{request.providerEmail || 'Sin correo registrado'}</dd></div><div><dt>Solicitante</dt><dd>{request.requesterName}</dd></div></dl>
          {request.notes && <div className="supplier-detail-notes"><strong>Observaciones</strong><p>{request.notes}</p></div>}
          {request.rejectionReason && <div className="request-rejection"><strong>Motivo de rechazo</strong><p>{request.rejectionReason}</p><small>{request.rejectedByName} · {request.rejectedAt}</small></div>}
        </Card>
        <Card className="request-detail-items"><h2>Conceptos solicitados</h2>{request.items.map((item) => <div className="request-detail-item" key={item.id}><div><strong>{item.name}</strong><small>{item.description || (item.productId ? 'Producto del catálogo' : 'Insumo fuera de catálogo')}</small></div><span>{item.quantity} {item.unit}</span></div>)}</Card>
      </div>

      {request.status === 'BORRADOR' && request.requesterId === user.id && <Card className="request-actions-card"><h2>Borrador</h2><p>Edita la información guardada o envíala cuando esté lista para revisión.</p><div><Button icon={Save} className="button--secondary" onClick={() => navigate(`/compras/solicitudes/${id}/editar`)}>Editar borrador</Button><Button icon={Send} onClick={() => act(() => updatePurchaseRequest(id, { providerId: request.providerId, date: request.date, priority: request.priority, items: request.items, notes: request.notes }, true), 'Solicitud enviada para aprobación.')}>Enviar para aprobación</Button></div></Card>}
      {['BORRADOR', 'PENDIENTE'].includes(request.status) && request.requesterId === user.id && <Card className="request-actions-card"><h2>Cancelar solicitud</h2><p>La solicitud se conservará en el historial con estado Cancelada.</p><Button icon={XCircle} className="button--danger" onClick={() => { if (window.confirm('¿Deseas cancelar esta solicitud?')) act(() => cancelPurchaseRequest(id), 'Solicitud cancelada.') }}>Cancelar solicitud</Button></Card>}

      {canManage && request.status === 'PENDIENTE' && <Card className="request-approval-card"><h2>Revisión administrativa</h2><p>Puede ajustar proveedor y cantidades antes de aprobar. La aprobación no modifica el inventario.</p>
        <label className="field"><span className="field__label">Proveedor</span><select value={reviewProviderId} onChange={(event) => setReviewProviderId(event.target.value)}>{suppliers.filter((supplier) => supplier.estado === 'ACTIVO').map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nombre}</option>)}</select></label>
        <div className="request-review-items">{reviewItems.map((item) => <label className="field" key={item.id}><span className="field__label">{item.name} · cantidad</span><input type="number" min="0.001" step="any" value={item.quantity} onChange={(event) => setReviewItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, quantity: event.target.value } : entry))} /></label>)}</div>
        <Button icon={Save} className="button--secondary" onClick={() => act(() => updatePurchaseRequest(id, { providerId: reviewProviderId, date: request.date, items: reviewItems, notes: request.notes }), 'Cambios de revisión guardados.')}>Guardar ajustes</Button>
        <label className="field"><span className="field__label">Motivo de rechazo</span><textarea rows="3" value={rejectionReason} placeholder="Obligatorio para rechazar" onChange={(event) => setRejectionReason(event.target.value)} /></label><div><Button icon={XCircle} className="button--danger" onClick={() => act(() => rejectRequest(id, rejectionReason), 'Solicitud rechazada.')}>Rechazar</Button><Button icon={CheckCircle2} onClick={() => { if (window.confirm('¿Deseas aprobar esta solicitud y generar la orden de compra?')) act(() => approveRequest(id), 'Solicitud aprobada y orden generada.') }}>Aprobar solicitud</Button></div></Card>}

      {request.order && <Card className="purchase-order">
        <div className="purchase-order__header"><BrandLogo /><div><small>ORDEN DE COMPRA</small><strong>{request.order.orderNumber}</strong><span>{request.order.generatedAt}</span></div></div>
        <div className="purchase-order__parties"><div><small>Proveedor</small><strong>{request.providerName}</strong><span>{request.providerEmail || 'Sin correo'}</span></div><div><small>Autorización</small><strong>{request.approvedByName}</strong><span>Solicitó: {request.requesterName}</span></div></div>
        <table><thead><tr><th>Concepto</th><th>Descripción</th><th>Cantidad</th></tr></thead><tbody>{request.items.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.description || '—'}</td><td>{item.quantity} {item.unit}</td></tr>)}</tbody></table>
        <p className="purchase-order__pdf"><FileText size={18} /> Representación lista para conectar con un generador de PDF.</p>
      </Card>}

      {canManage && request.status === 'APROBADA' && <Card className="request-actions-card"><h2>Envío al proveedor</h2><p>El correo real todavía no está configurado. Esta acción prepara destinatario, orden y futuro PDF sin marcar el correo como enviado.</p><Button icon={Mail} onClick={() => { if (window.confirm('¿Deseas preparar esta orden de compra para enviarla al proveedor?')) act(() => prepareRequestEmail(id), 'Orden preparada. El correo aún no ha sido enviado.') }}>Preparar envío</Button>{request.emailPreparation && <Badge tone="warning">Lista para integración de correo</Badge>}</Card>}

      {canManage && request.order && request.status !== 'RECIBIDA' && <Card className="request-reception-card"><h2>Confirmar recepción</h2><p>Solo los productos del catálogo generan entradas de inventario.</p>{request.items.filter((item) => item.productId).map((item) => <label className="field" key={item.id}><span className="field__label">{item.name} · cantidad recibida</span><input type="number" min="0.001" step="any" value={quantities[item.id] ?? ''} onChange={(event) => setQuantities((current) => ({ ...current, [item.id]: event.target.value }))} /></label>)}<Button icon={PackageCheck} onClick={() => { if (window.confirm('¿Confirmas la recepción y actualización del inventario?')) act(() => receiveRequest(id, quantities), 'Recepción confirmada e inventario actualizado.') }}>Confirmar recepción</Button></Card>}
    </div>
  )
}
