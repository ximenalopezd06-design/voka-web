function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function calculateResultingStock(movement) {
  const previous = Number(movement.stockAnterior)
  const quantity = Number(movement.cantidad)

  if (movement.tipo === 'ENTRADA') return previous + Math.abs(quantity)
  if (movement.tipo === 'SALIDA') return previous - Math.abs(quantity)
  return previous + quantity
}

export function isMovementConsistent(movement) {
  return Math.abs(calculateResultingStock(movement) - Number(movement.stockResultante)) < 0.000001
}

export function filterMovements(movements, products, filters = {}) {
  const {
    search = '',
    type = 'TODOS',
    reason = 'TODOS',
    dateFrom = '',
    dateTo = '',
    status = 'TODOS',
    userId = 'TODOS',
    productId = 'TODOS',
  } = filters
  const query = normalize(search)
  const productsById = new Map(products.map((product) => [product.id, product]))

  return movements.filter((movement) => {
    const product = productsById.get(movement.productoId)
    const matchesSearch = !query
      || normalize(movement.nombreProducto).includes(query)
      || normalize(product?.codigoBarras).includes(query)
    const matchesType = type === 'TODOS' || movement.tipo === type
    const matchesReason = reason === 'TODOS' || movement.motivo === reason
    const matchesFrom = !dateFrom || movement.fecha >= dateFrom
    const matchesTo = !dateTo || movement.fecha <= dateTo
    const matchesStatus = status === 'TODOS' || (movement.estado ?? 'APLICADO') === status
    const matchesUser = userId === 'TODOS' || movement.userId === userId
    const matchesProduct = productId === 'TODOS' || movement.productoId === productId
    return matchesSearch && matchesType && matchesReason && matchesFrom && matchesTo && matchesStatus && matchesUser && matchesProduct
  })
}

export function getMovementSummary(movements) {
  return movements.reduce((summary, movement) => {
    summary.total += 1
    if (movement.tipo === 'ENTRADA') summary.entries += 1
    if (movement.tipo === 'SALIDA') summary.exits += 1
    if (movement.tipo === 'AJUSTE') summary.adjustments += 1
    return summary
  }, { entries: 0, exits: 0, adjustments: 0, total: 0 })
}
