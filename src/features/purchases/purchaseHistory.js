const ACTIONS = {
  CREADA: { status: 'BORRADOR', label: 'Solicitud creada' },
  ENVIADA_A_APROBACION: { status: 'PENDIENTE', label: 'Enviada para aprobación' },
  EN_REVISION: { status: 'PENDIENTE', label: 'En revisión' },
  APROBADA: { status: 'APROBADA', label: 'Solicitud aprobada' },
  RECHAZADA: { status: 'RECHAZADA', label: 'Solicitud rechazada' },
  ENVIO_PREPARADO: { status: 'APROBADA', label: 'Envío al proveedor preparado' },
  CORREO_ENVIADO: { status: 'ENVIADA', label: 'Correo enviado al proveedor' },
  RECIBIDA: { status: 'RECIBIDA', label: 'Mercancía recibida' },
  RECIBIDA_POR_MOVIMIENTO: { status: 'RECIBIDA', label: 'Mercancía recibida' },
  CANCELADA: { status: 'CANCELADA', label: 'Compra cancelada' },
  FINALIZADA: { status: 'CONFIRMADA', label: 'Compra finalizada' },
}

function event({ at, status, label, userName, observations = '' }) {
  return { at, status, label, userName: userName || 'Sistema Villa Dulce', observations }
}

export function getPurchaseRequestHistory(request) {
  if (!request) return []
  const events = (request.audit ?? []).map((entry) => {
    const config = ACTIONS[entry.action] ?? { status: request.status, label: entry.action.replaceAll('_', ' ').toLowerCase() }
    return event({ at: entry.at, status: config.status, label: config.label, userName: entry.userName, observations: entry.comment })
  })

  if (!events.some((item) => item.label === 'Solicitud creada')) {
    events.push(event({ at: request.createdAt, status: 'BORRADOR', label: 'Solicitud creada', userName: request.requesterName, observations: request.notes }))
  }
  if (request.submittedAt) {
    if (!events.some((item) => item.label === 'Enviada para aprobación')) events.push(event({ at: request.submittedAt, status: 'PENDIENTE', label: 'Enviada para aprobación', userName: request.requesterName }))
    events.push(event({ at: request.submittedAt, status: 'PENDIENTE', label: 'Pendiente de aprobación', userName: 'Sistema Villa Dulce' }))
  }
  if (request.approvedAt && !events.some((item) => item.label === 'Solicitud aprobada')) {
    events.push(event({ at: request.approvedAt, status: 'APROBADA', label: 'Solicitud aprobada', userName: request.approvedByName }))
  }
  if (request.order?.generatedAt) {
    events.push(event({ at: request.order.generatedAt, status: 'APROBADA', label: 'Orden de compra generada', userName: request.approvedByName, observations: request.order.orderNumber }))
  }
  if (request.emailPreparation?.emailStatus === 'ENVIADO_REALMENTE') {
    events.push(event({ at: request.emailPreparation.sentAt, status: 'ENVIADA', label: 'Correo enviado al proveedor', userName: request.emailPreparation.sentByName, observations: request.emailPreparation.recipient }))
  }
  if (request.receivedAt) {
    if (!events.some((item) => item.label === 'Mercancía recibida')) events.push(event({ at: request.receivedAt, status: 'RECIBIDA', label: 'Mercancía recibida', userName: request.receivedByName }))
    events.push(event({ at: request.receivedAt, status: 'RECIBIDA', label: 'Entrada registrada al inventario', userName: request.receivedByName, observations: request.order?.orderNumber }))
  }

  return events
    .filter((item) => item.at)
    .map((item, index) => ({ ...item, sequence: index }))
    .sort((a, b) => a.at.localeCompare(b.at) || a.sequence - b.sequence)
}
