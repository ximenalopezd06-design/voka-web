export const MOVEMENT_REQUEST_STATUS = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  APLICADO: 'Aplicado',
}

export const MOVEMENT_STATUS_TONES = {
  BORRADOR: 'neutral',
  PENDIENTE: 'warning',
  APROBADO: 'success',
  RECHAZADO: 'danger',
  APLICADO: 'info',
}

export const ENTRY_REASONS = ['Recepción de compra', 'Devolución de cliente', 'Ajuste positivo', 'Producto encontrado en inventario', 'Otro']
export const EXIT_REASONS = ['Venta', 'Producto dañado', 'Producto caducado', 'Consumo interno', 'Muestra', 'Ajuste negativo', 'Otro']

export function validateMovementRequest(data, product) {
  const errors = {}
  if (!data.reason) errors.reason = 'Selecciona un motivo.'
  if (data.reason === 'Recepción de compra' && !data.orderRequestId) errors.orderRequestId = 'Selecciona la orden de compra recibida.'
  if (!product) errors.productId = 'Selecciona un producto.'
  const quantity = Number(data.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) errors.quantity = 'La cantidad debe ser mayor que cero.'
  if (data.type === 'SALIDA' && product && quantity > Number(product.stockActual)) errors.quantity = 'La salida no puede superar el stock actual.'
  return errors
}
