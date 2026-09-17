import { CheckCircle2, ClipboardCheck, FileText, Inbox, Mail, PackageCheck, Send, Settings2, UserRoundSearch, X, XCircle } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { getPurchaseRequestHistory } from '../purchaseHistory'
import { REQUEST_STATUSES, REQUEST_STATUS_TONES } from '../requestRules'

function dateParts(value = '') {
  const parsed = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(parsed.getTime())) return { date: value || '—', time: '—' }
  return {
    date: new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed),
    time: new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', hour12: true }).format(parsed),
  }
}

function eventVisual(entry) {
  const label = entry.label.toLowerCase()
  if (label.includes('rechaz') || label.includes('cancel')) return { icon: XCircle, tone: 'red' }
  if (label.includes('correo') || label.includes('proveedor')) return { icon: Mail, tone: 'purple' }
  if (label.includes('recib') || label.includes('mercanc')) return { icon: PackageCheck, tone: 'turquoise' }
  if (label.includes('inventario') || label.includes('automát') || label.includes('pendiente')) return { icon: Settings2, tone: 'gray' }
  if (label.includes('aprob') || label.includes('finaliz')) return { icon: CheckCircle2, tone: 'green' }
  if (label.includes('revisión') || label.includes('abrió')) return { icon: UserRoundSearch, tone: 'orange' }
  if (label.includes('enviada')) return { icon: Send, tone: 'orange' }
  if (label.includes('orden')) return { icon: ClipboardCheck, tone: 'purple' }
  if (label.includes('entrada')) return { icon: Inbox, tone: 'turquoise' }
  return { icon: FileText, tone: 'blue' }
}

export function PurchaseRequestDrawer({ request, onClose }) {
  if (!request) return null
  const history = getPurchaseRequestHistory(request)

  return <div className="purchase-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <aside className="purchase-request-drawer purchase-history-drawer" role="dialog" aria-modal="true" aria-label={`Historial de ${request.requestNumber}`}>
      <header className="purchase-drawer__header"><div><small>Compras</small><h2>Historial de la solicitud</h2></div><button type="button" aria-label="Cerrar" onClick={onClose}><X size={21} /></button></header>

      <div className="purchase-history-drawer__summary">
        <div><span>Folio</span><strong>{request.requestNumber}</strong></div>
        <Badge tone={REQUEST_STATUS_TONES[request.status]}>{REQUEST_STATUSES[request.status]}</Badge>
      </div>

      <div className="purchase-drawer__content">
        <div className="purchase-history-cards">{history.map((entry, index) => {
          const parts = dateParts(entry.at)
          const visual = eventVisual(entry)
          const Icon = visual.icon
          return <article className={`purchase-history-event purchase-history-event--${visual.tone}`} key={`${entry.at}-${entry.label}-${index}`}>
            <div className="purchase-history-event__rail"><span><Icon size={17} /></span></div>
            <div className="purchase-history-event__card">
              <time><strong>{parts.date}</strong><span>{parts.time}</span></time>
              <h3>{entry.label}</h3>
              <p><span>Usuario</span><strong>{entry.userName}</strong></p>
              {entry.observations && <p className="purchase-history-event__observation"><span>Observación</span><strong>{entry.observations}</strong></p>}
            </div>
          </article>
        })}</div>
      </div>

      <footer className="purchase-drawer__footer purchase-history-drawer__footer"><Button className="button--secondary" onClick={onClose}>Cerrar</Button></footer>
    </aside>
  </div>
}
