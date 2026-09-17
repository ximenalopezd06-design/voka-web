import { Eye, FilterX, Pencil, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { usePermission } from '../../auth/usePermission'
import { useProducts } from '../../products/ProductContext'
import { PurchaseRequestDrawer } from '../components/PurchaseRequestDrawer'
import { REQUEST_STATUSES, REQUEST_STATUS_TONES } from '../requestRules'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)
const normalize = (value = '') => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const FILTER_STATUSES = ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA']

function latestUpdate(request) {
  return [request.receivedAt, request.rejectedAt, request.approvedAt, request.emailPreparation?.preparedAt, ...(request.audit ?? []).map((entry) => entry.at), request.createdAt].filter(Boolean).sort().at(-1) || request.date
}

export function PurchaseRequestsPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const canCreate = usePermission('compras', 'create')
  const { purchaseRequests } = useProducts()
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ folio: '', status: 'TODAS', provider: 'TODOS', requester: 'TODOS', administrator: 'TODOS', from: '', to: '' })
  const visibleRequests = purchaseRequests.filter((request) => request.status !== 'BORRADOR' && (user.rol !== 'CAJERA' || request.requesterId === user.id))
  const providers = [...new Set(visibleRequests.map((request) => request.providerName))]
  const requesters = [...new Set(visibleRequests.map((request) => request.requesterName))]
  const administrators = [...new Set(visibleRequests.map((request) => request.approvedByName || request.rejectedByName).filter(Boolean))]
  const requests = useMemo(() => visibleRequests.filter((request) => {
    const createdDate = (request.createdAt || request.date).slice(0, 10)
    return (!filters.folio || normalize(request.requestNumber).includes(normalize(filters.folio)))
      && (filters.status === 'TODAS' || request.status === filters.status)
      && (filters.provider === 'TODOS' || request.providerName === filters.provider)
      && (filters.requester === 'TODOS' || request.requesterName === filters.requester)
      && (filters.administrator === 'TODOS' || (request.approvedByName || request.rejectedByName) === filters.administrator)
      && (!filters.from || createdDate >= filters.from)
      && (!filters.to || createdDate <= filters.to)
  }), [visibleRequests, filters])
  const summary = {
    total: requests.length,
    pending: requests.filter((request) => ['ENVIADA_SOLICITUD', 'PENDIENTE', 'EN_REVISION'].includes(request.status)).length,
    approved: requests.filter((request) => ['APROBADA', 'ENVIADA', 'CONFIRMADA', 'RECIBIDA', 'FINALIZADA'].includes(request.status)).length,
    rejected: requests.filter((request) => request.status === 'RECHAZADA').length,
  }

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function clearFilters() {
    setFilters({ folio: '', status: 'TODAS', provider: 'TODOS', requester: 'TODOS', administrator: 'TODOS', from: '', to: '' })
  }

  return <div className="purchase-requests-page">
    <PageHeader title="Compras" description="Consulta, administra y da seguimiento a las solicitudes de compra." action={canCreate ? <Button icon={Plus} onClick={() => navigate('/compras/nueva-solicitud')}>Nueva solicitud</Button> : null} />
    <Card className="purchase-history-filter-panel">
      <div className="purchase-history-filter-panel__heading"><Search size={18} /><div><h2>Buscar y filtrar solicitudes</h2><p>Utiliza uno o varios filtros para localizar rápidamente una solicitud.</p></div></div>
      <div className="purchase-history-filters">
        <label className="catalog-filter purchase-history-folio"><span>Folio</span><div className="catalog-filter__control"><Search size={19} /><input value={filters.folio} placeholder="SC-2026-..." onChange={(event) => updateFilter('folio', event.target.value)} /></div></label>
        <label className="catalog-filter"><span>Estado</span><select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="TODAS">Todos</option>{FILTER_STATUSES.map((key) => <option key={key} value={key}>{REQUEST_STATUSES[key]}</option>)}</select></label>
        <label className="catalog-filter"><span>Proveedor</span><select value={filters.provider} onChange={(event) => updateFilter('provider', event.target.value)}><option value="TODOS">Todos</option>{providers.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label className="catalog-filter"><span>Usuario</span><select value={filters.requester} onChange={(event) => updateFilter('requester', event.target.value)}><option value="TODOS">Todos</option>{requesters.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label className="catalog-filter"><span>Administrador</span><select value={filters.administrator} onChange={(event) => updateFilter('administrator', event.target.value)}><option value="TODOS">Todos</option>{administrators.map((name) => <option key={name}>{name}</option>)}</select></label>
        <label className="catalog-filter"><span>Fecha inicial</span><input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => updateFilter('from', event.target.value)} /></label>
        <label className="catalog-filter"><span>Fecha final</span><input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => updateFilter('to', event.target.value)} /></label>
        <button className="clear-filters-button purchase-history-clear" type="button" onClick={clearFilters}><FilterX size={19} /><span>Limpiar filtros</span></button>
      </div>
    </Card>
    <div className="purchase-history-summary" aria-label="Resumen de solicitudes filtradas">
      <span>Mostrando</span>
      <Badge tone="info">{summary.total} solicitudes</Badge>
      <span>Pendientes</span>
      <Badge tone="warning">{summary.pending}</Badge>
      <span>Aprobadas</span>
      <Badge tone="success">{summary.approved}</Badge>
      <span>Rechazadas</span>
      <Badge tone="danger">{summary.rejected}</Badge>
    </div>
    <Card className="request-results purchase-history-results"><div className="product-table-wrap"><table className="product-table purchase-history-table"><thead><tr><th>Folio</th><th>Fecha de creación</th><th>Proveedor</th><th>Productos solicitados</th><th>Total estimado</th><th>Usuario solicitante</th><th>Administrador responsable</th><th>Estado actual</th><th>Última actualización</th><th>Acciones</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td><strong>{request.requestNumber}</strong></td><td>{request.createdAt || request.date}</td><td>{request.providerName}</td><td><div className="purchase-history-products"><strong>{request.items.map((item) => item.name).filter(Boolean).join(', ') || 'Sin productos'}</strong><small>{request.items.length} {request.items.length === 1 ? 'producto' : 'productos'}</small></div></td><td>{money(request.estimatedTotal)}</td><td>{request.requesterName}</td><td>{request.approvedByName || request.rejectedByName || 'Sin asignar'}</td><td><Badge tone={REQUEST_STATUS_TONES[request.status]}>{REQUEST_STATUSES[request.status]}</Badge></td><td>{latestUpdate(request)}</td><td><div className="purchase-history-actions">{request.status === 'BORRADOR' && (request.requesterId === user.id || user.rol === 'ADMINISTRADOR') && <button type="button" className="icon-button" title="Editar borrador" aria-label={`Editar ${request.requestNumber}`} onClick={() => navigate(`/compras/solicitudes/${request.id}/editar`)}><Pencil size={17} /></button>}<button type="button" className="icon-button purchase-history-eye" title="Ver historial" aria-label={`Ver historial de ${request.requestNumber}`} onClick={() => setSelected(request)}><Eye size={18} /></button></div></td></tr>)}</tbody></table>{!requests.length && <div className="catalog-empty"><span>📝</span><h2>Sin solicitudes</h2><p>No hay solicitudes con los filtros seleccionados.</p></div>}</div></Card>
    <PurchaseRequestDrawer request={selected} onClose={() => setSelected(null)} />
  </div>
}
