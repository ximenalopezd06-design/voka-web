export const REQUEST_STATUSES = {
  BORRADOR: 'Borrador',
  ENVIADA_SOLICITUD: 'Enviada',
  PENDIENTE: 'Pendiente de aprobación',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  ENVIADA: 'Orden enviada al proveedor',
  CONFIRMADA: 'Confirmada',
  RECIBIDA: 'Recibida',
  CANCELADA: 'Cancelada',
  FINALIZADA: 'Finalizada',
}

export const REQUEST_STATUS_TONES = {
  BORRADOR: 'warning',
  ENVIADA_SOLICITUD: 'warning',
  PENDIENTE: 'warning',
  EN_REVISION: 'info',
  APROBADA: 'success',
  RECHAZADA: 'danger',
  ENVIADA: 'info',
  CONFIRMADA: 'info',
  RECIBIDA: 'success',
  CANCELADA: 'neutral',
  FINALIZADA: 'success',
}

export const REQUEST_UNITS = ['Pieza', 'Paquete', 'Caja', 'Kilogramo', 'Gramo', 'Litro', 'Mililitro', 'Otro']

export function calculateRequestTotal(items) {
  return Math.round(items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.estimatedCost || 0), 0) * 100) / 100
}

export function validatePurchaseRequest({ providerId, items }) {
  const errors = {}
  if (!providerId) errors.providerId = 'Selecciona un proveedor.'
  if (!items.length) errors.items = 'Agrega al menos un producto o insumo.'
  if (items.some((item) => !item.name?.trim() || !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0 || !item.unit)) {
    errors.items = 'Todos los conceptos requieren nombre, cantidad mayor que cero y unidad.'
  }
  return errors
}

export function canEditRequest(request) {
  return ['BORRADOR', 'PENDIENTE'].includes(request.status)
}

export function filterPurchaseRequests(requests, { search = '', status = 'TODAS' }, user) {
  const query = search.trim().toLocaleLowerCase('es')
  return requests.filter((request) => {
    if (user?.rol === 'CAJERA' && request.requesterId !== user.id) return false
    const matchesSearch = !query || [request.requestNumber, request.requesterName, request.providerName]
      .some((value) => value?.toLocaleLowerCase('es').includes(query))
    return matchesSearch && (status === 'TODAS' || request.status === status)
  })
}
