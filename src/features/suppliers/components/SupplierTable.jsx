import { Eye, Pencil, Power, PowerOff } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'

export function SupplierTable({ suppliers, onView, onEdit, onToggle, canEdit, canManage }) {
  if (!suppliers.length) return <div className="catalog-empty"><span>📦</span><h2>No encontramos proveedores</h2><p>Prueba con otra búsqueda o limpia los filtros.</p></div>

  return (
    <div className="product-table-wrap">
      <table className="product-table supplier-table">
        <thead><tr><th>Proveedor</th><th>Contacto</th><th>Teléfono</th><th>Correo</th><th>Estado</th><th>Acciones</th></tr></thead>
        <tbody>
          {suppliers.map((supplier) => {
            const active = supplier.estado === 'ACTIVO'
            return (
              <tr key={supplier.id} className={active ? '' : 'product-table__row--inactive'}>
                <td><div className="supplier-name"><span>{supplier.nombre.slice(0, 2).toUpperCase()}</span><div><strong>{supplier.nombre}</strong><small>{supplier.rfc || 'Sin RFC'}</small></div></div></td>
                <td>{supplier.contacto}</td>
                <td>{supplier.telefono}</td>
                <td>{supplier.correo || 'Sin correo'}</td>
                <td><Badge tone={active ? 'success' : 'danger'}>{active ? 'Activo' : 'Inactivo'}</Badge></td>
                <td><div className="product-actions">
                  <button className="icon-button" type="button" title="Ver información" onClick={() => onView(supplier)}><Eye size={18} /></button>
                  {canEdit && <button className="icon-button" type="button" title="Editar proveedor" onClick={() => onEdit(supplier)}><Pencil size={18} /></button>}
                  {canManage && <button className={`icon-button${active ? ' icon-button--danger' : ' icon-button--success'}`} type="button" title={active ? 'Desactivar' : 'Activar'} onClick={() => onToggle(supplier)}>{active ? <PowerOff size={18} /> : <Power size={18} />}</button>}
                </div></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <footer className="product-table__footer">Mostrando {suppliers.length} {suppliers.length === 1 ? 'proveedor' : 'proveedores'}</footer>
    </div>
  )
}
