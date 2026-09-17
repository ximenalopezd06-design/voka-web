import { Bell, CheckCircle2, ClipboardList, PackageSearch, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useProducts } from '../../products/ProductContext'
import { useSettings } from '../SettingsContext'

const NOTIFICATION_LIFETIME_MS = 24 * 60 * 60 * 1000

function eventDate(value) {
  if (!value) return null
  const parsed = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isNotificationRecent(value, now = new Date()) {
  const date = eventDate(value)
  if (!date) return false
  const age = now.getTime() - date.getTime()
  return age >= 0 && age < NOTIFICATION_LIFETIME_MS
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [clock, setClock] = useState(() => Date.now())
  const navigate = useNavigate()
  const user = useCurrentUser()
  const { products, movements, purchaseRequests, movementRequests } = useProducts()
  const { preferences } = useSettings()
  useEffect(() => {
    const interval = window.setInterval(() => setClock(Date.now()), 60_000)
    return () => window.clearInterval(interval)
  }, [])
  const notifications = useMemo(() => {
    if (!preferences.notifications.enabled) return []
    const result = []
    if (user.rol === 'ADMINISTRADOR') {
      if (preferences.notifications.purchaseRequests) {
        purchaseRequests.filter((request) => request.status === 'PENDIENTE' && isNotificationRecent(request.submittedAt ?? request.createdAt)).forEach((request) => result.push({ id: `pending-${request.id}`, text: `Nueva solicitud ${request.requestNumber} pendiente de aprobación.`, icon: ClipboardList, path: `/compras/solicitudes/${request.id}` }))
        movementRequests.filter((request) => request.status === 'PENDIENTE' && isNotificationRecent(`${request.date} ${request.time}`)).forEach((request) => result.push({ id: `movement-${request.id}`, text: `${request.type === 'ENTRADA' ? 'Entrada' : 'Salida'} de ${request.productName} pendiente de aprobación.`, icon: ClipboardList, path: `/inventario/movimientos/${request.id}` }))
      }
      if (preferences.notifications.lowStock) {
        products.filter((product) => Number(product.stockActual) <= Number(product.stockMinimo)).forEach((product) => {
          const latestMovement = movements
            .filter((movement) => movement.productoId === product.id)
            .sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`))[0]
          if (isNotificationRecent(latestMovement && `${latestMovement.fecha} ${latestMovement.hora}`)) {
            result.push({ id: `stock-${product.id}`, text: `${product.nombre} tiene stock bajo.`, icon: PackageSearch, path: '/inventario/alertas' })
          }
        })
      }
    } else {
      purchaseRequests.filter((request) => request.requesterId === user.id).forEach((request) => {
        if (request.status === 'APROBADA' && preferences.notifications.requestApproved && isNotificationRecent(request.approvedAt)) result.push({ id: `approved-${request.id}`, text: `La solicitud ${request.requestNumber} fue aceptada.`, icon: CheckCircle2, path: `/compras/solicitudes/${request.id}` })
        if (request.status === 'RECHAZADA' && preferences.notifications.requestRejected && isNotificationRecent(request.rejectedAt)) result.push({ id: `rejected-${request.id}`, text: `La solicitud ${request.requestNumber} fue rechazada.`, icon: XCircle, path: `/compras/solicitudes/${request.id}` })
      })
      movementRequests.filter((request) => request.createdById === user.id && request.status === 'RECHAZADO' && isNotificationRecent(request.rejectedAt)).forEach((request) => result.push({ id: `movement-rejected-${request.id}`, text: `El movimiento de ${request.productName} fue rechazado.`, icon: XCircle, path: `/inventario/movimientos/${request.id}` }))
    }
    return result
  }, [preferences.notifications, products, movements, purchaseRequests, movementRequests, user, clock])

  return <div className="notification-center">
    <button className="notification-button" type="button" aria-label="Notificaciones" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <Bell size={23} />
      {notifications.length > 0 && <span className="notification-button__count">{notifications.length > 9 ? '9+' : notifications.length}</span>}
    </button>
    {open && <div className="notification-popover"><div><h3>Notificaciones</h3><small>{notifications.length} pendientes</small></div>{notifications.length ? notifications.map((notification) => { const Icon = notification.icon; return <button key={notification.id} type="button" onClick={() => { navigate(notification.path); setOpen(false) }}><span><Icon size={18} /></span><p>{notification.text}</p></button> }) : <p className="notification-popover__empty">No tienes notificaciones pendientes.</p>}</div>}
  </div>
}
