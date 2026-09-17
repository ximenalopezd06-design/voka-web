import { Edit3, Eye, KeyRound, UserPlus, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useEmployees } from '../../employees/EmployeeContext'

const EMPTY_USER = { nombre: '', apellido: '', username: '', email: '', telefono: '', rol: 'CAJERA', estado: 'ACTIVO', password: '', passwordConfirmation: '', permisos: {} }

function UserForm({ employee, onClose, onSaved }) {
  const actor = useCurrentUser()
  const { createEmployee, updateEmployee } = useEmployees()
  const [form, setForm] = useState(employee ? { ...EMPTY_USER, ...employee } : EMPTY_USER)
  const [error, setError] = useState('')
  const editing = Boolean(employee)

  function change(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    try {
      if (editing) await updateEmployee(employee.id, form, actor)
      else await createEmployee(form, actor)
      onSaved(editing ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.')
      onClose()
    } catch (caught) {
      setError(caught.validationErrors ? Object.values(caught.validationErrors)[0] : caught.message || 'No fue posible guardar el usuario.')
    }
  }

  return <div className="settings-modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><section className="settings-user-modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title"><header><div><span>{editing ? 'Editar información' : 'Nuevo usuario'}</span><h2 id="user-form-title">{editing ? `${employee.nombre} ${employee.apellido}` : 'Crear usuario'}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar"><X /></button></header><form onSubmit={submit}><div className="settings-fields-grid">
    <label className="field"><span className="field__label">Nombre *</span><input name="nombre" required value={form.nombre} onChange={change} /></label>
    <label className="field"><span className="field__label">Apellido *</span><input name="apellido" required value={form.apellido} onChange={change} /></label>
    <label className="field"><span className="field__label">Usuario *</span><input name="username" required value={form.username} onChange={change} /></label>
    <label className="field"><span className="field__label">Correo</span><input name="email" type="email" value={form.email ?? ''} onChange={change} /></label>
    <label className="field"><span className="field__label">Teléfono</span><input name="telefono" value={form.telefono ?? ''} onChange={change} /></label>
    <label className="field"><span className="field__label">Rol</span><select name="rol" value={form.rol} onChange={change}><option value="ADMINISTRADOR">Administrador</option><option value="CAJERA">Cajera</option></select></label>
    <label className="field"><span className="field__label">Estado</span><select name="estado" value={form.estado} onChange={change}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
    {!editing && <><label className="field"><span className="field__label">Contraseña inicial *</span><input name="password" type="password" required minLength="8" value={form.password} onChange={change} /></label><label className="field"><span className="field__label">Confirmar contraseña *</span><input name="passwordConfirmation" type="password" required minLength="8" value={form.passwordConfirmation} onChange={change} /></label></>}
  </div>{error && <p className="login-error" role="alert">{error}</p>}<footer><Button type="button" className="button--secondary" onClick={onClose}>Cancelar</Button><Button type="submit">{editing ? 'Guardar cambios' : 'Crear usuario'}</Button></footer></form></section></div>
}

function PasswordDialog({ employee, onClose, onSaved }) {
  const actor = useCurrentUser()
  const { changeEmployeePassword } = useEmployees()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  async function submit(event) {
    event.preventDefault()
    try { await changeEmployeePassword(employee.id, password, confirmation, actor); onSaved('Contraseña restablecida correctamente.'); onClose() }
    catch (caught) { setError(caught.message || 'No fue posible restablecer la contraseña.') }
  }
  return <div className="settings-modal-backdrop"><section className="settings-user-modal settings-password-modal" role="dialog" aria-modal="true"><header><div><span>Credenciales</span><h2>Restablecer contraseña</h2><p>{employee.nombre} {employee.apellido}</p></div><button type="button" onClick={onClose} aria-label="Cerrar"><X /></button></header><form onSubmit={submit}><label className="field"><span className="field__label">Nueva contraseña</span><input type="password" minLength="8" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="field"><span className="field__label">Confirmar contraseña</span><input type="password" minLength="8" required value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>{error && <p className="login-error">{error}</p>}<footer><Button type="button" className="button--secondary" onClick={onClose}>Cancelar</Button><Button type="submit" icon={KeyRound}>Restablecer</Button></footer></form></section></div>
}

function UserDetailDrawer({ employee, onClose }) {
  const activity = [
    ['Inicio de sesión', employee.ultimaSesion || 'Sin actividad registrada'],
    ['Ventas realizadas', employee.rol === 'CAJERA' ? '24 durante los últimos 7 días' : 'No aplica'],
    ['Solicitudes de compra', employee.rol === 'CAJERA' ? '3 solicitudes creadas' : '5 solicitudes revisadas'],
    ['Movimientos de inventario', employee.rol === 'CAJERA' ? '2 entradas registradas' : '8 movimientos supervisados'],
  ]
  return <div className="settings-drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="settings-user-drawer" aria-label="Detalle del usuario"><header><div><span>Detalle del usuario</span><h2>{employee.nombre} {employee.apellido}</h2></div><button type="button" onClick={onClose} aria-label="Cerrar"><X /></button></header><div className="settings-user-drawer__body"><section><h3>Información general</h3><dl className="settings-user-detail-list"><div><dt>Nombre completo</dt><dd>{employee.nombre} {employee.apellido}</dd></div><div><dt>Usuario</dt><dd>{employee.username}</dd></div><div><dt>Rol</dt><dd>{employee.rolLabel}</dd></div><div><dt>Correo</dt><dd>{employee.email || 'No registrado'}</dd></div><div><dt>Teléfono</dt><dd>{employee.telefono || 'No registrado'}</dd></div><div><dt>Fecha de creación</dt><dd>{employee.fechaCreacion || 'No disponible'}</dd></div><div><dt>Último acceso</dt><dd>{employee.ultimaSesion || 'Sin iniciar sesión'}</dd></div></dl></section><section><h3>Actividad reciente</h3><div className="settings-user-activity">{activity.map(([title, value]) => <article key={title}><i /><div><strong>{title}</strong><span>{value}</span></div></article>)}</div></section></div><footer><Button className="button--secondary" onClick={onClose}>Cerrar</Button></footer></aside></div>
}

export function UserManagementSection({ onMessage, onError }) {
  const actor = useCurrentUser()
  const { employees, toggleEmployeeStatus } = useEmployees()
  const [editor, setEditor] = useState(null)
  const [detail, setDetail] = useState(null)
  const [passwordUser, setPasswordUser] = useState(null)
  function toggle(employee) {
    if (employee.id === actor.id) return onError('No puedes desactivar tu propio usuario.')
    if (!window.confirm(`¿Deseas ${employee.estado === 'ACTIVO' ? 'desactivar' : 'activar'} a ${employee.nombre} ${employee.apellido}?`)) return
    try { toggleEmployeeStatus(employee.id, actor); onMessage('Estado del usuario actualizado.') } catch (error) { onError(error.message) }
  }
  return <><Card className="settings-card"><div className="settings-card__heading"><UsersIcon /><div><h2>Usuarios y permisos</h2><p>Centro de administración de cuentas, roles, accesos y credenciales.</p></div></div><div className="settings-users-toolbar"><span><strong>{employees.filter((item) => item.estado === 'ACTIVO').length}</strong> usuarios activos de {employees.length}</span><Button icon={UserPlus} onClick={() => setEditor('new')}>Crear usuario</Button></div><div className="product-table-wrap"><table className="product-table settings-users-table"><thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th><th>Último acceso</th><th>Acciones</th></tr></thead><tbody>{employees.map((employee) => <tr key={employee.id}><td><strong>{employee.nombre} {employee.apellido}</strong></td><td>{employee.username}</td><td><Badge tone={employee.rol === 'ADMINISTRADOR' ? 'warning' : 'info'}>{employee.rolLabel}</Badge></td><td><Badge tone={employee.estado === 'ACTIVO' ? 'success' : 'danger'}>{employee.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</Badge></td><td>{employee.ultimaSesion || 'Sin iniciar sesión'}</td><td><div className="settings-user-icon-actions"><button title="Ver detalle" onClick={() => setDetail(employee)}><Eye /></button><button title="Editar información" onClick={() => setEditor(employee)}><Edit3 /></button><button title="Restablecer contraseña" onClick={() => setPasswordUser(employee)}><KeyRound /></button><button className="settings-status-action" onClick={() => toggle(employee)}>{employee.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}</button></div></td></tr>)}</tbody></table></div></Card>{editor && <UserForm employee={editor === 'new' ? null : editor} onClose={() => setEditor(null)} onSaved={onMessage} />}{passwordUser && <PasswordDialog employee={passwordUser} onClose={() => setPasswordUser(null)} onSaved={onMessage} />}{detail && <UserDetailDrawer employee={detail} onClose={() => setDetail(null)} />}</>
}

function UsersIcon(props) { return <UserPlus {...props} /> }
