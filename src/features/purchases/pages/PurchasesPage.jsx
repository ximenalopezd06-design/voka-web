import { ClipboardList, FilterX, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { useProducts } from '../../products/ProductContext'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { PurchaseTable } from '../components/PurchaseTable'
import { filterPurchases } from '../purchaseRules'
import { usePermission } from '../../auth/usePermission'
import { REQUEST_STATUSES, REQUEST_STATUS_TONES } from '../requestRules'

export function PurchasesPage() {
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { purchases, suppliers, purchaseRequests } = useProducts()
  const canCreate = usePermission('compras', 'create')
  const ownRequests = purchaseRequests.filter((request) => request.requesterId === user.id)
  const [search, setSearch] = useState('')
  const [supplierId, setSupplierId] = useState('TODOS')
  const [status, setStatus] = useState('TODOS')
  const [date, setDate] = useState('')
  const filteredPurchases = useMemo(
    () => filterPurchases(purchases, { search, supplierId, status, date }),
    [purchases, search, supplierId, status, date],
  )

  function clearFilters() {
    setSearch('')
    setSupplierId('TODOS')
    setStatus('TODOS')
    setDate('')
  }

  return (
    <div className="purchases-page">
      <PageHeader title="Compras" description="Consulta compras y solicitudes de abastecimiento." action={user.rol === 'ADMINISTRADOR' ? <div className="page-header-actions"><Button icon={ClipboardList} className="button--secondary" onClick={() => navigate('/compras/solicitudes')}>Solicitudes</Button>{canCreate && <Button icon={Plus} onClick={() => navigate('/compras/nueva-solicitud')}>Nueva solicitud</Button>}</div> : null} />
      {user.rol === 'CAJERA' && <Card className="cashier-request-status">
        <div className="cashier-request-status__heading"><div><h2>Mis solicitudes de compra</h2><p>Consulta aquí si fueron aceptadas o rechazadas sin salir de Compras.</p></div><Button className="button--secondary" onClick={() => navigate('/compras/nueva-solicitud')}>Nueva solicitud</Button></div>
        {ownRequests.length ? <div className="cashier-request-list">{ownRequests.map((request) => <button type="button" key={request.id} onClick={() => navigate(`/compras/solicitudes/${request.id}`)}><div><strong>{request.requestNumber}</strong><small>{request.providerName} · {request.date}</small>{request.status === 'RECHAZADA' && request.rejectionReason && <em>{request.rejectionReason}</em>}</div><Badge tone={REQUEST_STATUS_TONES[request.status]}>{REQUEST_STATUSES[request.status]}</Badge></button>)}</div> : <div className="cashier-request-status__empty">Aún no has creado solicitudes de compra.</div>}
      </Card>}
      <Card className="purchase-filters">
        <label className="catalog-filter purchase-search"><span>Buscar</span><div className="catalog-filter__control"><Search size={21} /><input type="search" value={search} placeholder="Folio o proveedor..." onChange={(event) => setSearch(event.target.value)} /></div></label>
        <label className="catalog-filter"><span>Proveedor</span><select value={supplierId} onChange={(event) => setSupplierId(event.target.value)}><option value="TODOS">Todos</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.nombre}</option>)}</select></label>
        <label className="catalog-filter"><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos</option><option value="COMPLETADA">Completada</option><option value="CANCELADA">Cancelada</option></select></label>
        <label className="catalog-filter"><span>Fecha</span><input className="movement-date-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <button className="clear-filters-button" type="button" onClick={clearFilters} aria-label="Limpiar filtros"><FilterX size={21} /></button>
      </Card>
      <Card className="purchase-results"><PurchaseTable purchases={filteredPurchases} /></Card>
    </div>
  )
}
