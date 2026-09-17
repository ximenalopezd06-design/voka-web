import { FilterX, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { usePermission } from '../../auth/usePermission'
import { useProducts } from '../../products/ProductContext'
import { SupplierTable } from '../components/SupplierTable'
import { filterSuppliers } from '../supplierRules'

export function SuppliersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { suppliers, toggleSupplierStatus } = useProducts()
  const canCreate = usePermission('proveedores', 'create')
  const canEdit = usePermission('proveedores', 'edit')
  const canManage = usePermission('proveedores', 'manage')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('TODOS')
  const filtered = useMemo(() => filterSuppliers(suppliers, { search, status }), [suppliers, search, status])

  function toggle(supplier) {
    const action = supplier.estado === 'ACTIVO' ? 'desactivar' : 'activar'
    const message = supplier.estado === 'ACTIVO' ? '¿Deseas desactivar este proveedor?' : '¿Deseas activar este proveedor?'
    if (window.confirm(message)) {
      toggleSupplierStatus(supplier.id)
      window.setTimeout(() => window.alert(`Proveedor ${action === 'activar' ? 'activado' : 'desactivado'} correctamente.`), 0)
    }
  }

  return (
    <div className="suppliers-page">
      {location.state?.message && <div className="catalog-toast" role="status">{location.state.message}</div>}
      <PageHeader title="Proveedores" description="Consulta y administra los proveedores de Villa Dulce." action={canCreate ? <Button icon={Plus} onClick={() => navigate('/proveedores/nuevo')}>Nuevo proveedor</Button> : null} />
      <Card className="catalog-filters supplier-filters">
        <label className="catalog-filter catalog-filter--search"><span>Buscar proveedor</span><div className="catalog-filter__control"><Search size={22} /><input type="search" value={search} placeholder="Nombre, contacto, teléfono o RFC..." onChange={(event) => setSearch(event.target.value)} /></div></label>
        <label className="catalog-filter"><span>Estado</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="TODOS">Todos</option><option value="ACTIVO">Activos</option><option value="INACTIVO">Inactivos</option></select></label>
        <button className="clear-filters-button" type="button" title="Limpiar filtros" onClick={() => { setSearch(''); setStatus('TODOS') }}><FilterX size={22} /></button>
      </Card>
      <Card className="supplier-results"><SupplierTable suppliers={filtered} canEdit={canEdit} canManage={canManage} onView={(supplier) => navigate(`/proveedores/${supplier.id}`)} onEdit={(supplier) => navigate(`/proveedores/editar/${supplier.id}`)} onToggle={toggle} /></Card>
    </div>
  )
}
