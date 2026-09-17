import { ArrowLeft, FilterX, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../../components/layout/PageHeader'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'
import { useProducts } from '../../../products/ProductContext'
import { MOVEMENT_REASONS, MOVEMENT_TYPES } from '../movementConstants'
import { filterMovements } from '../movementRules'
import { MovementSummary } from '../components/MovementSummary'
import { MovementTable } from '../components/MovementTable'
import { usePermission } from '../../../auth/usePermission'

export function InventoryMovementsPage() {
  const navigate = useNavigate()
  const { products, movements, movementRequests } = useProducts()
  const canCreate = usePermission('movimientos', 'create')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('TODOS')
  const [reason, setReason] = useState('TODOS')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [userId, setUserId] = useState('TODOS')
  const [productId, setProductId] = useState('TODOS')
  const allMovements = useMemo(() => [
    ...movementRequests.filter((request) => request.status !== 'APLICADO').map((request) => ({
      id: request.id,
      fecha: request.date,
      hora: request.time,
      productoId: request.productId,
      nombreProducto: request.productName,
      tipo: request.type,
      cantidad: request.quantity,
      stockAnterior: null,
      stockResultante: null,
      motivo: request.reason,
      comentarios: request.observations,
      userId: request.createdById,
      usuario: request.createdByName,
      approvedByName: request.approvedByName,
      estado: request.status,
      referencia: request.id,
    })),
    ...movements.map((movement) => ({ ...movement, estado: movement.estado ?? 'APLICADO' })),
  ], [movementRequests, movements])
  const users = useMemo(() => [...new Map(allMovements.map((movement) => [movement.userId, movement.usuario])).entries()], [allMovements])

  const filteredMovements = useMemo(
    () => filterMovements(allMovements, products, { search, type, reason, dateFrom, dateTo, status, userId, productId }),
    [allMovements, products, search, type, reason, dateFrom, dateTo, status, userId, productId],
  )

  function clearFilters() {
    setSearch('')
    setType('TODOS')
    setReason('TODOS')
    setDateFrom('')
    setDateTo('')
    setStatus('TODOS')
    setUserId('TODOS')
    setProductId('TODOS')
  }

  return (
    <div className="movements-page">
      <PageHeader
        title="Movimientos"
        description="Consulta todos los cambios registrados en el inventario de Villa Dulce."
        action={
          <div className="page-header-actions">
            <Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/inventario')}>Volver</Button>
            {canCreate && <Button icon={Plus} onClick={() => navigate('/inventario/nuevo-movimiento')}>Nuevo movimiento</Button>}
          </div>
        }
      />

      <MovementSummary movements={allMovements} />

      <Card className="movement-filters">
        <label className="catalog-filter movement-search">
          <span>Buscar</span>
          <div className="catalog-filter__control">
            <Search size={22} />
            <input type="search" value={search} placeholder="Producto o código de barras..." onChange={(event) => setSearch(event.target.value)} />
          </div>
        </label>
        <div className="movement-filter-grid">
          <label className="catalog-filter">
            <span>Tipo de movimiento</span>
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="TODOS">Todos</option>
              {MOVEMENT_TYPES.map((item) => <option key={item} value={item}>{item[0] + item.slice(1).toLowerCase()}</option>)}
            </select>
          </label>
          <label className="catalog-filter"><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos</option><option value="PENDIENTE">Pendientes</option><option value="APLICADO">Aplicados</option><option value="RECHAZADO">Rechazados</option></select></label>
          <label className="catalog-filter"><span>Usuario</span><select value={userId} onChange={(event) => setUserId(event.target.value)}><option value="TODOS">Todos</option>{users.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
          <label className="catalog-filter"><span>Producto</span><select value={productId} onChange={(event) => setProductId(event.target.value)}><option value="TODOS">Todos</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nombre}</option>)}</select></label>
          <label className="catalog-filter">
            <span>Motivo</span>
            <select value={reason} onChange={(event) => setReason(event.target.value)}>
              <option value="TODOS">Todos los motivos</option>
              {MOVEMENT_REASONS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="catalog-filter">
            <span>Desde</span>
            <input className="movement-date-input" type="date" value={dateFrom} max={dateTo || undefined} onChange={(event) => setDateFrom(event.target.value)} />
          </label>
          <label className="catalog-filter">
            <span>Hasta</span>
            <input className="movement-date-input" type="date" value={dateTo} min={dateFrom || undefined} onChange={(event) => setDateTo(event.target.value)} />
          </label>
          <button className="clear-filters-button" type="button" onClick={clearFilters} aria-label="Limpiar filtros" title="Limpiar filtros"><FilterX size={22} /></button>
        </div>
      </Card>

      <Card className="movement-results">
        <MovementTable movements={filteredMovements} products={products} />
      </Card>
    </div>
  )
}
