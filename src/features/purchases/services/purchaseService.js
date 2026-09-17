import { prepareInventoryMovement } from '../../inventory/services/inventoryMovementService.js'
import { calculatePurchaseItemSubtotal, calculatePurchaseTotal, validatePurchase } from '../purchaseRules.js'

function purchaseFolio(sequence) {
  return `VD-C-${String(sequence).padStart(4, '0')}`
}

export function preparePurchase({
  products,
  supplier,
  items,
  date,
  notes = '',
  user,
  sequence,
  now = new Date(),
  id = `pur-${Date.now().toString(36)}`,
}) {
  const errors = validatePurchase({ supplierId: supplier?.id, date, items })
  if (Object.keys(errors).length) {
    const error = new Error('La compra contiene datos inválidos.')
    error.validationErrors = errors
    throw error
  }

  const workingProducts = new Map(products.map((product) => [product.id, product]))
  const movements = []
  const purchaseItems = []

  items.forEach((item, index) => {
    const product = workingProducts.get(item.productoId)
    if (!product || product.estado !== 'ACTIVO') {
      const error = new Error(`El producto ${item.nombreProducto ?? item.productoId} no está disponible.`)
      error.validationErrors = { items: error.message }
      throw error
    }

    const transaction = prepareInventoryMovement({
      product,
      type: 'ENTRADA',
      quantity: Number(item.cantidad),
      reason: 'Compra',
      comments: `Compra ${purchaseFolio(sequence)}. ${notes}`.trim(),
      user,
      now,
      id: `mov-${id}-${index + 1}`,
    })
    const updatedProduct = {
      ...transaction.updatedProduct,
      costoCompra: Number(item.costoUnitario),
    }
    workingProducts.set(product.id, updatedProduct)
    movements.push(transaction.movement)
    purchaseItems.push({
      id: `pitem-${id}-${index + 1}`,
      purchaseId: id,
      productoId: product.id,
      producto: product.nombre,
      cantidad: Number(item.cantidad),
      costoUnitario: Number(item.costoUnitario),
      subtotal: calculatePurchaseItemSubtotal(item),
    })
  })

  const purchase = {
    id,
    folio: purchaseFolio(sequence),
    providerId: supplier.id,
    providerName: supplier.nombre,
    // Alias de presentación para mantener compatibilidad con las vistas actuales.
    proveedor: supplier.nombre,
    fecha: date,
    total: calculatePurchaseTotal(items),
    cantidadProductos: items.length,
    usuarioId: user.id,
    usuario: user.nombre,
    rolUsuario: user.rolLabel ?? user.rol,
    estado: 'COMPLETADA',
    notas: notes.trim(),
  }

  return {
    purchase,
    purchaseItems,
    movements,
    products: Array.from(workingProducts.values()),
  }
}
