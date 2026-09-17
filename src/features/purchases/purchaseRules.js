function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export function calculatePurchaseItemSubtotal(item) {
  const quantity = Number(item.cantidad)
  const cost = Number(item.costoUnitario)
  if (!Number.isFinite(quantity) || !Number.isFinite(cost)) return 0
  return roundMoney(quantity * cost)
}

export function calculatePurchaseTotal(items) {
  return roundMoney(items.reduce((total, item) => total + calculatePurchaseItemSubtotal(item), 0))
}

export function validatePurchase({ supplierId, date, items }) {
  const errors = {}
  const itemErrors = {}

  if (!supplierId) errors.supplierId = 'Selecciona un proveedor.'
  if (!date) errors.date = 'Selecciona la fecha de la compra.'
  if (!items.length) errors.items = 'Agrega al menos un producto.'

  items.forEach((item) => {
    const currentErrors = {}
    const quantity = Number(item.cantidad)
    const cost = Number(item.costoUnitario)
    if (item.cantidad === '' || !Number.isFinite(quantity) || quantity <= 0) {
      currentErrors.cantidad = 'La cantidad debe ser mayor que cero.'
    }
    if (item.costoUnitario === '' || !Number.isFinite(cost)) {
      currentErrors.costoUnitario = 'Ingresa el costo unitario.'
    } else if (cost < 0) {
      currentErrors.costoUnitario = 'El costo no puede ser negativo.'
    }
    if (Object.keys(currentErrors).length) itemErrors[item.productoId] = currentErrors
  })

  if (Object.keys(itemErrors).length) errors.itemErrors = itemErrors
  return errors
}

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filterPurchases(purchases, filters = {}) {
  const { search = '', supplierId = 'TODOS', status = 'TODOS', date = '' } = filters
  const query = normalize(search)
  return purchases.filter((purchase) => {
    const matchesSearch = !query
      || normalize(purchase.folio).includes(query)
      || normalize(purchase.proveedor).includes(query)
    const matchesSupplier = supplierId === 'TODOS' || (purchase.providerId ?? purchase.proveedorId) === supplierId
    const matchesStatus = status === 'TODOS' || purchase.estado === status
    const matchesDate = !date || purchase.fecha === date
    return matchesSearch && matchesSupplier && matchesStatus && matchesDate
  })
}
