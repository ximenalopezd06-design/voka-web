const REASONS_BY_TYPE = {
  ENTRADA: ['Compra', 'Recepción de compra', 'Devolución', 'Devolución de cliente', 'Producto encontrado en inventario', 'Otro'],
  SALIDA: ['Merma', 'Producto dañado', 'Producto caducado', 'Consumo interno', 'Muestra', 'Venta', 'Otro'],
  AJUSTE: ['Corrección de inventario', 'Conteo físico', 'Ajuste positivo', 'Ajuste negativo', 'Otro'],
}

function roundStock(value) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000
}

function localDateTime(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const getPart = (type) => parts.find((part) => part.type === type)?.value
  return {
    fecha: `${getPart('year')}-${getPart('month')}-${getPart('day')}`,
    hora: `${getPart('hour')}:${getPart('minute')}`,
  }
}

export function getReasonsForMovementType(type) {
  return REASONS_BY_TYPE[type] ?? []
}

export function calculateMovementStock({ type, currentStock, quantity, adjustmentDirection = 'INCREASE' }) {
  const stock = Number(currentStock)
  const amount = Number(quantity)
  if (!Number.isFinite(stock) || !Number.isFinite(amount)) return Number.NaN

  if (type === 'ENTRADA') return roundStock(stock + amount)
  if (type === 'SALIDA') return roundStock(stock - amount)
  if (type === 'AJUSTE') {
    const signedAmount = adjustmentDirection === 'DECREASE' ? -amount : amount
    return roundStock(stock + signedAmount)
  }
  return Number.NaN
}

export function validateInventoryMovement({ product, type, quantity, reason, adjustmentDirection = 'INCREASE' }) {
  const errors = {}
  const amount = Number(quantity)

  if (!type) errors.type = 'Selecciona un tipo de movimiento.'
  if (!product) errors.productId = 'Selecciona un producto.'
  else if (product.estado !== 'ACTIVO') errors.productId = 'No se pueden registrar movimientos para productos inactivos.'
  if (quantity === '' || quantity === null || quantity === undefined) errors.quantity = 'Ingresa una cantidad.'
  else if (!Number.isFinite(amount) || amount <= 0) errors.quantity = 'La cantidad debe ser mayor que cero.'
  if (!reason) errors.reason = 'Selecciona un motivo.'
  else if (type && !getReasonsForMovementType(type).includes(reason)) errors.reason = 'El motivo no corresponde al tipo seleccionado.'

  if (product && Number.isFinite(amount) && amount > 0) {
    const resultingStock = calculateMovementStock({
      type,
      currentStock: product.stockActual,
      quantity: amount,
      adjustmentDirection,
    })
    if (type === 'SALIDA' && amount > Number(product.stockActual)) {
      errors.quantity = 'La salida no puede superar el stock disponible.'
    }
    if (resultingStock < 0 && !errors.quantity) {
      errors.quantity = 'El movimiento no puede generar stock negativo.'
    }
  }

  return errors
}

export function prepareInventoryMovement({
  product,
  type,
  quantity,
  reason,
  comments = '',
  adjustmentDirection = 'INCREASE',
  user,
  now = new Date(),
  id = `mov-${Date.now().toString(36)}`,
}) {
  const errors = validateInventoryMovement({ product, type, quantity, reason, adjustmentDirection })
  if (Object.keys(errors).length > 0) {
    const error = new Error('El movimiento contiene datos inválidos.')
    error.validationErrors = errors
    throw error
  }

  const amount = Number(quantity)
  const stockAnterior = Number(product.stockActual)
  const stockResultante = calculateMovementStock({
    type,
    currentStock: stockAnterior,
    quantity: amount,
    adjustmentDirection,
  })
  const signedQuantity = type === 'AJUSTE' && adjustmentDirection === 'DECREASE' ? -amount : amount
  const { fecha, hora } = localDateTime(now)

  return {
    updatedProduct: { ...product, stockActual: stockResultante },
    movement: {
      id,
      fecha,
      hora,
      productoId: product.id,
      nombreProducto: product.nombre,
      tipo: type,
      cantidad: signedQuantity,
      stockAnterior,
      stockResultante,
      motivo: reason,
      comentarios: comments.trim(),
      userId: user.id,
      usuario: user.nombre,
      role: user.rolLabel ?? user.rol,
    },
  }
}
