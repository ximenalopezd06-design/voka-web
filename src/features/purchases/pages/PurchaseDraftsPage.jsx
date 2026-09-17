import { Eye, FileEdit, Pencil, Send, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'

export function PurchaseDraftsPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { purchaseRequests, updatePurchaseRequest, deletePurchaseDraft } = useProducts()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const drafts = purchaseRequests.filter((request) => request.status === 'BORRADOR' && (user.rol === 'ADMINISTRADOR' || request.requesterId === user.id))

  function submitDraft(request) {
    try {
      updatePurchaseRequest(request.id, {
        providerId: request.providerId,
        date: request.date,
        priority: request.priority,
        items: request.items,
        notes: request.notes,
      }, true)
      setMessage(`${request.requestNumber} fue enviada para aprobación.`)
      setError('')
    } catch (caught) {
      setError(caught.validationErrors ? Object.values(caught.validationErrors)[0] : caught.message)
      setMessage('')
    }
  }

  function removeDraft(request) {
    if (!window.confirm('¿Deseas eliminar este borrador? Esta acción no se puede deshacer.')) return
    try {
      deletePurchaseDraft(request.id)
      setMessage(`${request.requestNumber} fue eliminado.`)
      setError('')
    } catch (caught) {
      setError(caught.message)
    }
  }

  return <div className="purchase-drafts-page">
    <PageHeader title="Borradores" description="Administra las solicitudes de compra que todavía no han sido enviadas." action={<Button icon={FileEdit} onClick={() => navigate('/compras/nueva-solicitud')}>Nueva solicitud</Button>} />
    {message && <div className="catalog-toast" role="status">{message}</div>}
    {error && <p className="purchase-form-error" role="alert">{error}</p>}
    <Card className="purchase-drafts-card">
      <div className="purchase-drafts-card__heading"><div><h2>Solicitudes guardadas</h2><p>{drafts.length} {drafts.length === 1 ? 'borrador disponible' : 'borradores disponibles'}</p></div><Badge tone="warning">{drafts.length} borradores</Badge></div>
      <div className="product-table-wrap">
        <table className="product-table purchase-drafts-table">
          <thead><tr><th>Folio</th><th>Fecha de creación</th><th>Proveedor</th><th>Número de productos</th><th>Última modificación</th><th>Usuario creador</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>{drafts.map((request) => <tr key={request.id}>
            <td><strong>{request.requestNumber}</strong></td>
            <td>{request.createdAt || request.date}</td>
            <td>{request.providerName || 'Sin seleccionar'}</td>
            <td>{request.items.length}</td>
            <td>{request.updatedAt || request.createdAt || request.date}</td>
            <td>{request.requesterName}</td>
            <td><Badge tone="warning">Borrador</Badge></td>
            <td><div className="purchase-draft-actions">
              <button type="button" className="icon-button" title="Ver información" aria-label={`Ver ${request.requestNumber}`} onClick={() => navigate(`/compras/solicitudes/${request.id}`)}><Eye size={17} /></button>
              <button type="button" className="icon-button" title="Continuar edición" aria-label={`Editar ${request.requestNumber}`} onClick={() => navigate(`/compras/solicitudes/${request.id}/editar`)}><Pencil size={17} /></button>
              <button type="button" className="icon-button icon-button--success" title="Enviar para aprobación" aria-label={`Enviar ${request.requestNumber}`} onClick={() => submitDraft(request)}><Send size={17} /></button>
              <button type="button" className="icon-button icon-button--danger" title="Eliminar borrador" aria-label={`Eliminar ${request.requestNumber}`} onClick={() => removeDraft(request)}><Trash2 size={17} /></button>
            </div></td>
          </tr>)}</tbody>
        </table>
        {!drafts.length && <div className="purchase-drafts-empty"><span>📝</span><h2>No hay borradores</h2><p>Las solicitudes guardadas como borrador aparecerán en esta sección.</p><Button icon={FileEdit} onClick={() => navigate('/compras/nueva-solicitud')}>Crear solicitud</Button></div>}
      </div>
    </Card>
  </div>
}
