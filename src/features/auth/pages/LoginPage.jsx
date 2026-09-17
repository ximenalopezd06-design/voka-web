import { Eye, EyeOff, LockKeyhole, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../../components/brand/BrandLogo'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useAuth } from '../AuthContext'
import { useEmployees } from '../../employees/EmployeeContext'
import { ProfileSelect } from '../components/ProfileSelect'

export function LoginPage() {
  const navigate = useNavigate()
  const { currentUser, isAuthenticated, login } = useAuth()
  const { loginProfiles: profiles } = useEmployees()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function submitLogin(event) {
    event.preventDefault()
    if (!selectedUserId) {
      setError('Selecciona un perfil para continuar.')
      return
    }
    if (!password) {
      setError('Introduce tu contraseña.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const user = await login({ userId: selectedUserId, password })
      setPassword('')
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Usuario o contraseña incorrectos.')
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-page__decoration login-page__decoration--pink" />
      <div className="login-page__decoration login-page__decoration--blue" />
      <section className="login-shell">
        <div className="login-brand-panel">
          <BrandLogo compact />
          <div className="login-candy-showcase" aria-label="Villa Dulce">
            <div className="login-candy-showcase__sprinkles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <div className="login-candy-showcase__illustration" aria-hidden="true">
              <span className="login-candy login-candy--lollipop">🍭</span>
              <span className="login-candy login-candy--wrapped">🍬</span>
              <span className="login-candy login-candy--chocolate">🍫</span>
              <span className="login-candy login-candy--cupcake">🧁</span>
            </div>
            <h1><span>VILLA</span><strong>DULCE</strong></h1>
            <div className="login-candy-showcase__dots" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="login-candy-showcase__footer" aria-hidden="true">🍬 <span>✦</span> 🍭 <span>✦</span> 🍫</div>
        </div>

        <Card className="login-card">
          <div className="login-card__heading">
            <span><LockKeyhole size={24} /></span>
            <div><h2>Iniciar sesión</h2><p>Selecciona tu perfil e ingresa tu contraseña.</p></div>
          </div>
          <form onSubmit={submitLogin} noValidate>
            <ProfileSelect
              profiles={profiles}
              value={selectedUserId}
              onChange={(userId) => {
                setSelectedUserId(userId)
                setError('')
                setPassword('')
              }}
            />

            <label className="field login-password" htmlFor="loginPassword">
              <span className="field__label">Contraseña</span>
              <div className="login-password__control">
                <LockKeyhole size={19} />
                <input id="loginPassword" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} placeholder="Ingresa tu contraseña" onChange={(event) => { setPassword(event.target.value); setError('') }} />
                <button type="button" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <Button type="submit" icon={LogIn} disabled={submitting}>{submitting ? 'Validando...' : 'Ingresar'}</Button>
          </form>
          <p className="login-card__notice">Acceso exclusivo para personal autorizado de Villa Dulce.</p>
        </Card>
      </section>
    </main>
  )
}
