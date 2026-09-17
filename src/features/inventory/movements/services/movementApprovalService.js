import { prepareInventoryMovement } from '../../services/inventoryMovementService.js'
import { validateMovementRequest } from '../movementRequestRules.js'

function localParts(now = new Date()) {
  const value = now.toLocaleString('sv-SE', { hour12: false })
  return { date: value.slice(0, 10), time: value.slice(11, 16), at: value.slice(0, 16) }
}

export function prepareMovementRequest({ data, product, user, status, now = new Date() }) {
  const errors = validateMovementRequest(data, product)
  if (Object.keys(errors).length) {
    const error = new Error('INVALID_MOVEMENT_REQUEST')
    error.validationErrors = errors
    throw error
  }
  const { date, time, at } = localParts(now)
  const id = `mreq-${Date.now().toString(36)}`
  return {
    id,
    date,
    time,
    createdById: user.id,
    createdByName: user.nombre,
    type: data.type,
    reason: data.reason,
    providerId: data.providerId || null,
    orderRequestId: data.orderRequestId || null,
    reference: data.reference || null,
    productId: product.id,
    productName: product.nombre,
    quantity: Number(data.quantity),
    unit: product.unidadVenta,
    observations: data.observations?.trim() || '',
    evidence: data.evidence ?? [],
    status,
    audit: [{ action: status === 'BORRADOR' ? 'BORRADOR_GUARDADO' : 'ENVIADO', userId: user.id, userName: user.nombre, at }],
  }
}

export function applyApprovedMovement({ request, product, approver, now = new Date() }) {
  const isAdjustment = request.reason === 'Ajuste positivo' || request.reason === 'Ajuste negativo'
  const type = isAdjustment ? 'AJUSTE' : request.type
  const adjustmentDirection = request.reason === 'Ajuste negativo' ? 'DECREASE' : 'INCREASE'
  const serviceReason = request.reason === 'Recepción de compra'
    ? 'Compra'
    : request.reason === 'Devolución de cliente'
      ? 'Devolución'
      : request.reason
  const transaction = prepareInventoryMovement({
    product,
    type,
    quantity: request.quantity,
    reason: serviceReason,
    adjustmentDirection,
    comments: request.observations,
    user: { id: request.createdById, nombre: request.createdByName, rolLabel: 'Solicitante' },
    now,
    id: `mov-${request.id}`,
  })
  const { at } = localParts(now)
  transaction.movement.estado = 'APLICADO'
  transaction.movement.approvedById = approver.id
  transaction.movement.approvedByName = approver.nombre
  transaction.movement.approvedAt = at
  transaction.movement.solicitudId = request.id
  transaction.movement.evidencia = request.evidence
  transaction.movement.referencia = request.reference || request.id
  return {
    ...transaction,
    request: {
      ...request,
      status: 'APLICADO',
      approvedById: approver.id,
      approvedByName: approver.nombre,
      approvedAt: at,
      stockBefore: transaction.movement.stockAnterior,
      stockAfter: transaction.movement.stockResultante,
      audit: [...request.audit, { action: 'APROBADO_Y_APLICADO', userId: approver.id, userName: approver.nombre, at }],
    },
  }
}

export function rejectMovementRequest(request, reason, user, now = new Date()) {
  if (!reason.trim()) throw new Error('El motivo de rechazo es obligatorio.')
  const { at } = localParts(now)
  return {
    ...request,
    status: 'RECHAZADO',
    rejectionReason: reason.trim(),
    rejectedById: user.id,
    rejectedByName: user.nombre,
    rejectedAt: at,
    audit: [...request.audit, { action: 'RECHAZADO', userId: user.id, userName: user.nombre, at, comment: reason.trim() }],
  }
}
