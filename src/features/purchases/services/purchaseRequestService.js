import { prepareInventoryMovement } from '../../inventory/services/inventoryMovementService.js'
import { calculateRequestTotal, validatePurchaseRequest } from '../requestRules.js'

function timestamp(date = new Date()) {
  return date.toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
}

function sequenceNumber(prefix, sequence, date = new Date()) {
  return `${prefix}-${date.getFullYear()}-${String(sequence).padStart(4, '0')}`
}

export function preparePurchaseRequest({ data, supplier, user, sequence, status = 'BORRADOR', now = new Date() }) {
  const errors = status === 'BORRADOR' ? {} : validatePurchaseRequest(data)
  if (Object.keys(errors).length) {
    const error = new Error('INVALID_REQUEST')
    error.validationErrors = errors
    throw error
  }
  const at = timestamp(now)
  const id = `req-${Date.now().toString(36)}`
  return {
    id,
    requestNumber: sequenceNumber('SC', sequence, now),
    date: data.date,
    requesterId: user.id,
    requesterName: user.nombre,
    providerId: supplier?.id || null,
    providerName: supplier?.nombre || 'Sin seleccionar',
    providerEmail: supplier?.correo || '',
    priority: data.priority || 'NORMAL',
    items: data.items.map((item, index) => ({ ...item, id: `reqitem-${id}-${index + 1}`, quantity: Number(item.quantity), estimatedCost: item.estimatedCost === '' ? 0 : Number(item.estimatedCost) })),
    notes: data.notes?.trim() || '',
    estimatedTotal: calculateRequestTotal(data.items),
    status,
    createdAt: at,
    submittedAt: status === 'PENDIENTE' ? at : null,
    audit: [{ action: status === 'PENDIENTE' ? 'ENVIADA_A_APROBACION' : 'CREADA', userId: user.id, userName: user.nombre, at }],
  }
}

export function approvePurchaseRequest(request, user, orderSequence, now = new Date()) {
  const at = timestamp(now)
  return {
    ...request,
    status: 'APROBADA',
    approvedById: user.id,
    approvedByName: user.nombre,
    approvedAt: at,
    order: {
      id: `order-${request.id}`,
      orderNumber: sequenceNumber('OC', orderSequence, now),
      generatedAt: at,
      status: 'LISTA_PARA_ENVIAR',
    },
    audit: [...request.audit, { action: 'APROBADA', userId: user.id, userName: user.nombre, at }],
  }
}

export function rejectPurchaseRequest(request, reason, user, now = new Date()) {
  if (!reason.trim()) throw new Error('El motivo de rechazo es obligatorio.')
  const at = timestamp(now)
  return {
    ...request,
    status: 'RECHAZADA',
    rejectionReason: reason.trim(),
    rejectedById: user.id,
    rejectedByName: user.nombre,
    rejectedAt: at,
    audit: [...request.audit, { action: 'RECHAZADA', userId: user.id, userName: user.nombre, at, comment: reason.trim() }],
  }
}

// Punto de integración para un backend. No reporta un envío real.
export async function sendPurchaseOrderEmail() {
  return { sent: false, reason: 'EMAIL_SERVICE_NOT_CONFIGURED' }
}

export function prepareOrderForEmail(request, user, now = new Date()) {
  const at = timestamp(now)
  return {
    ...request,
    emailPreparation: {
      preparedAt: at,
      preparedById: user.id,
      preparedByName: user.nombre,
      recipient: request.providerEmail,
      pdfStatus: 'PENDIENTE_DE_GENERADOR',
      emailStatus: 'LISTO_PARA_INTEGRACION',
    },
    audit: [...request.audit, { action: 'ENVIO_PREPARADO', userId: user.id, userName: user.nombre, at }],
  }
}

export function receivePurchaseOrder({ request, products, quantities, user, now = new Date() }) {
  const catalogItems = request.items.filter((item) => item.productId)
  if (!catalogItems.length) throw new Error('La orden no contiene productos del catálogo para ingresar al inventario.')
  const workingProducts = new Map(products.map((product) => [product.id, product]))
  const movements = []
  catalogItems.forEach((item, index) => {
    const quantity = Number(quantities[item.id])
    const product = workingProducts.get(item.productId)
    const transaction = prepareInventoryMovement({
      product,
      type: 'ENTRADA',
      quantity,
      reason: 'Compra',
      comments: `Recepción de compra · ${request.order.orderNumber}`,
      user,
      now,
      id: `mov-${request.id}-${index + 1}`,
    })
    transaction.movement.referencia = request.order.orderNumber
    transaction.movement.motivo = 'Recepción de compra'
    workingProducts.set(product.id, transaction.updatedProduct)
    movements.push(transaction.movement)
  })
  const at = timestamp(now)
  return {
    products: [...workingProducts.values()],
    movements,
    request: {
      ...request,
      status: 'RECIBIDA',
      receivedById: user.id,
      receivedByName: user.nombre,
      receivedAt: at,
      receivedQuantities: quantities,
      order: { ...request.order, status: 'RECIBIDA' },
      audit: [...request.audit, { action: 'RECIBIDA', userId: user.id, userName: user.nombre, at }],
    },
  }
}
