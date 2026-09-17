import { ArrowLeft, Save, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { ROLE_PERMISSIONS } from '../../../utils/permissions'
import { useEmployees } from '../EmployeeContext'
import { useCurrentUser } from '../../auth/useCurrentUser'

const MODULES = [
  ['dashboard', 'Dashboard'], ['ventas', 'Ventas'], ['compras', 'Compras'],
  ['inventario', 'Inventario'], ['movimientos', 'Movimientos'],
  ['catalogo', 'Catálogo'], ['empleados', 'Empleados'],
  ['proveedores', 'Proveedores'], ['reportes', 'Reportes'], ['configuracion', 'Configuración'],
]
const ACTIONS = [['view', 'Consultar'], ['create', 'Crear'], ['edit', 'Editar'], ['delete', 'Eliminar'], ['manage', 'Administrar']]

function rolePermissionObject(role) {
  return Object.fromEntries(MODULES.map(([module]) => [module, Object.fromEntries(ACTIONS.map(([action]) => [
    action, ROLE_PERMISSIONS[role]?.[module]?.includes(action) ?? false,
  ]))]))
}

function employeePermissions(employee) {
  const defaults = rolePermissionObject(employee?.rol ?? 'CAJERA')
  if (!employee?.permisos) return defaults
  return Object.fromEntries(Object.entries(defaults).map(([module, actions]) => [
    module,
    { ...actions, ...employee.permisos[module] },
  ]))
}

export function EmployeeFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const { getEmployeeById, createEmployee, updateEmployee } = useEmployees()
  const employee = id ? getEmployeeById(id) : null
  const [form, setForm] = useState(() => ({
    nombre: employee?.nombre ?? '',
    apellido: employee?.apellido ?? '',
    username: employee?.username ?? '',
    rol: employee?.rol ?? 'CAJERA',
    estado: employee?.estado ?? 'ACTIVO',
    password: '',
    passwordConfirmation: '',
    permisos: employeePermissions(employee),
  }))
  const [error, setError] = useState('')
  const isEdit = Boolean(employee)
  const title = isEdit ? 'Editar empleado' : 'Nuevo empleado'
  const allRequired = useMemo(() => form.nombre.trim() && form.apellido.trim() && form.username.trim() && (isEdit || form.password), [form, isEdit])

  function change(event) {
    const { name, value } = event.target
    setForm((current) => {
      if (name !== 'rol') return { ...current, [name]: value }
      return { ...current, rol: value, permisos: rolePermissionObject(value) }
    })
    setError('')
  }

  function togglePermission(module, action) {
    setForm((current) => ({ ...current, permisos: { ...current.permisos, [module]: { ...current.permisos[module], [action]: !current.permisos[module]?.[action] } } }))
  }

  async function submit(event) {
    event.preventDefault()
    if (!allRequired) return setError('Completa todos los campos obligatorios.')
    if (form.password && form.password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    try {
      if (!isEdit && form.password !== form.passwordConfirmation) return setError('Las contraseñas no coinciden.')
      if (isEdit) await updateEmployee(employee.id, form, currentUser)
      else await createEmployee(form, currentUser)
      navigate('/empleados', { replace: true, state: { message: isEdit ? 'Perfil actualizado correctamente.' : 'Empleado creado correctamente.' } })
    } catch (caught) {
      setError(caught.validationErrors ? Object.values(caught.validationErrors)[0] : caught.message || 'No fue posible guardar el empleado.')
    }
  }

  if (id && !employee) return <div className="employees-page"><PageHeader title="Empleado no encontrado" action={<Button icon={ArrowLeft} onClick={() => navigate('/empleados')}>Volver</Button>} /></div>

  return (
    <div className="employees-page">
      <PageHeader title={title} description={isEdit ? 'Actualiza los datos, credenciales y permisos del empleado.' : 'Registra un nuevo integrante del equipo.'} action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/empleados')}>Volver</Button>} />
      <form onSubmit={submit} className="employee-form" noValidate>
        <Card className="employee-form__card">
          <h3>Información del empleado</h3>
          <div className="employee-form__grid">
            <label className="field"><span className="field__label">Nombre *</span><input name="nombre" value={form.nombre} onChange={change} /></label>
            <label className="field"><span className="field__label">Apellido *</span><input name="apellido" value={form.apellido} onChange={change} /></label>
            <label className="field"><span className="field__label">Usuario *</span><input name="username" autoComplete="off" value={form.username} onChange={change} /></label>
            <label className="field"><span className="field__label">Rol *</span><select name="rol" value={form.rol} onChange={change}><option value="ADMINISTRADOR">Administrador</option><option value="CAJERA">Cajera</option></select></label>
            <label className="field"><span className="field__label">Estado *</span><select name="estado" value={form.estado} onChange={change}><option value="ACTIVO">Activo</option><option value="INACTIVO">Inactivo</option></select></label>
            {!isEdit && <label className="field"><span className="field__label">Contraseña inicial *</span><input name="password" type="password" autoComplete="new-password" value={form.password} onChange={change} placeholder="Mínimo 8 caracteres" /></label>}
            {!isEdit && <label className="field"><span className="field__label">Confirmar contraseña *</span><input name="passwordConfirmation" type="password" autoComplete="new-password" value={form.passwordConfirmation} onChange={change} /></label>}
          </div>
        </Card>
        <Card className="employee-form__card permission-card">
          <div className="permission-card__heading"><ShieldCheck /><div><h3>Permisos específicos</h3><p>Se cargan según el rol y pueden personalizarse por empleado.</p></div></div>
          <div className="permission-matrix">
            <div className="permission-matrix__head"><strong>Módulo</strong>{ACTIONS.map(([, label]) => <span key={label}>{label}</span>)}</div>
            {MODULES.map(([module, label]) => <div className="permission-matrix__row" key={module}><strong>{label}</strong>{ACTIONS.map(([action, labelAction]) => <label key={action}><input type="checkbox" checked={Boolean(form.permisos[module]?.[action])} onChange={() => togglePermission(module, action)} /><span className="sr-only">{labelAction} {label}</span></label>)}</div>)}
          </div>
        </Card>
        {error && <p className="login-error" role="alert">{error}</p>}
        <div className="employee-form__actions"><Button type="button" className="button--secondary" onClick={() => navigate('/empleados')}>Cancelar</Button><Button type="submit" icon={Save}>Guardar empleado</Button></div>
      </form>
    </div>
  )
}
