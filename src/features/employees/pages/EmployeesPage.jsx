import { Edit3, KeyRound, Plus, Power, PowerOff, ShieldCheck, Users } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useEmployees } from '../EmployeeContext'

export function EmployeesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const currentUser = useCurrentUser()
  const { employees, toggleEmployeeStatus } = useEmployees()

  function toggle(employee) {
    if (employee.id === currentUser.id) {
      window.alert('No puedes desactivar tu propia sesión.')
      return
    }
    const action = employee.estado === 'ACTIVO' ? 'desactivar' : 'activar'
    if (window.confirm(`¿Deseas ${action} a ${employee.nombre} ${employee.apellido}?`)) toggleEmployeeStatus(employee.id, currentUser)
  }

  return (
    <div className="employees-page">
      {location.state?.message && <div className="catalog-toast" role="status">{location.state.message}</div>}
      <PageHeader title="Administración de Empleados" description="Gestiona usuarios, roles y permisos del equipo de Villa Dulce." action={<Button icon={Plus} onClick={() => navigate('/empleados/nuevo')}>Nuevo empleado</Button>} />
      <div className="employee-summary">
        <Card><span><Users /></span><div><small>Empleados</small><strong>{employees.length}</strong></div></Card>
        <Card><span><ShieldCheck /></span><div><small>Activos</small><strong>{employees.filter((item) => item.estado === 'ACTIVO').length}</strong></div></Card>
      </div>
      <Card className="employee-results">
        <div className="product-table-wrap">
          <table className="product-table employee-table">
            <thead><tr><th>Empleado</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Última sesión</th><th>Acciones</th></tr></thead>
            <tbody>
              {employees.map((employee) => {
                const active = employee.estado === 'ACTIVO'
                return (
                  <tr key={employee.id} className={active ? '' : 'product-table__row--inactive'}>
                    <td><div className="employee-cell"><span className={`login-profile__avatar login-profile__avatar--${employee.avatarTone}`}>{employee.iniciales}</span><div><strong>{employee.nombre} {employee.apellido}</strong><small>Alta: {employee.fechaCreacion}</small></div></div></td>
                    <td>{employee.username}</td>
                    <td><Badge tone={employee.rol === 'ADMINISTRADOR' ? 'warning' : 'info'}>{employee.rolLabel}</Badge></td>
                    <td><Badge tone={active ? 'success' : 'danger'}>{active ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td>{employee.ultimaSesion ? employee.ultimaSesion.replace(' ', ' · ') : 'Sin iniciar sesión'}</td>
                    <td><div className="product-actions">
                      <button className="icon-button" type="button" title="Editar y configurar permisos" onClick={() => navigate(`/empleados/editar/${employee.id}`)}><Edit3 size={18} /></button>
                      <button className="icon-button" type="button" title="Cambiar contraseña" onClick={() => { if (window.confirm(`¿Deseas cambiar la contraseña de ${employee.nombre} ${employee.apellido}?`)) navigate(`/empleados/${employee.id}/contrasena`) }}><KeyRound size={18} /></button>
                      <button className={`icon-button${active ? ' icon-button--danger' : ' icon-button--success'}`} type="button" title={active ? 'Desactivar' : 'Activar'} onClick={() => toggle(employee)}>{active ? <PowerOff size={18} /> : <Power size={18} />}</button>
                    </div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
