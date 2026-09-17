import { ArrowLeft, KeyRound, Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useEmployees } from '../EmployeeContext'

export function ChangeEmployeePasswordPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const { getEmployeeById, changeEmployeePassword } = useEmployees()
  const employee = getEmployeeById(id)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    try {
      await changeEmployeePassword(id, password, confirmation, currentUser)
      navigate('/empleados', { replace: true, state: { message: 'Contraseña actualizada correctamente.' } })
    } catch (caught) {
      setError(caught.message || 'No fue posible actualizar la contraseña.')
    }
  }

  if (!employee) return <div className="employees-page"><PageHeader title="Empleado no encontrado" action={<Button icon={ArrowLeft} onClick={() => navigate('/empleados')}>Volver</Button>} /></div>

  return (
    <div className="employees-page">
      <PageHeader title="Cambiar contraseña" description={`Actualiza las credenciales de ${employee.nombre} ${employee.apellido}.`} action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/empleados')}>Volver</Button>} />
      <form className="employee-form password-change-form" onSubmit={submit} noValidate>
        <Card className="employee-form__card">
          <div className="permission-card__heading"><KeyRound /><div><h3>Nueva contraseña</h3><p>La contraseña actual nunca se muestra ni se puede recuperar.</p></div></div>
          <div className="employee-form__grid">
            <label className="field"><span className="field__label">Nueva contraseña *</span><input autoFocus type="password" autoComplete="new-password" value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="Mínimo 8 caracteres" /></label>
            <label className="field"><span className="field__label">Confirmar contraseña *</span><input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => { setConfirmation(event.target.value); setError('') }} /></label>
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
        </Card>
        <div className="employee-form__actions"><Button type="button" className="button--secondary" onClick={() => navigate('/empleados')}>Cancelar</Button><Button type="submit" icon={Save}>Actualizar contraseña</Button></div>
      </form>
    </div>
  )
}
