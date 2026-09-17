export const INVENTORY_STATUS = {
  AVAILABLE: 'DISPONIBLE',
  LOW: 'STOCK_BAJO',
  EMPTY: 'AGOTADO',
}

export function getInventoryStatus(product) {
  const currentStock = Number(product.stockActual)
  const minimumStock = Number(product.stockMinimo)

  if (currentStock === 0) return INVENTORY_STATUS.EMPTY
  if (currentStock <= minimumStock) return INVENTORY_STATUS.LOW
  return INVENTORY_STATUS.AVAILABLE
}

function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filterInventory(products, { search = '', category = 'TODAS', inventoryStatus = 'TODOS' }) {
  const query = normalize(search)

  return products.filter((product) => {
    const matchesSearch = !query
      || normalize(product.nombre).includes(query)
      || normalize(product.codigoBarras).includes(query)
    const matchesCategory = category === 'TODAS' || product.categoria === category
    const matchesStatus = inventoryStatus === 'TODOS' || getInventoryStatus(product) === inventoryStatus
    return matchesSearch && matchesCategory && matchesStatus
  })
}

export function getInventorySummary(products) {
  return products.reduce((summary, product) => {
    const status = getInventoryStatus(product)
    summary.total += 1
    if (status === INVENTORY_STATUS.AVAILABLE) summary.available += 1
    if (status === INVENTORY_STATUS.LOW) summary.low += 1
    if (status === INVENTORY_STATUS.EMPTY) summary.empty += 1
    return summary
  }, { total: 0, available: 0, low: 0, empty: 0 })
}
