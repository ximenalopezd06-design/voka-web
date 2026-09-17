import { prepareInventoryMovement } from '../../inventory/services/inventoryMovementService.js'
import { calculateSaleItemSubtotal, calculateSaleTotal, validateSale } from '../saleRules.js'

function saleFolio(sequence) {
  return `V-${String(sequence).padStart(4, '0')}`
}

export function prepareSale({
  products,
  items,
  paymentMethod,
  paymentDetails = {},
  customer = '',
  discount = 0,
  observations = '',
  user,
  sequence,
  now = new Date(),
  id = `sale-${Date.now().toString(36)}`,
}) {
  const errors = validateSale({ items, paymentMethod, paymentDetails, products, discount })
  if (Object.keys(errors).length) {
    const error = new Error('La venta contiene datos inválidos.')
    error.validationErrors = errors
    throw error
  }

  const workingProducts = new Map(products.map((product) => [product.id, product]))
  const movements = []
  const saleItems = []
  const folio = saleFolio(sequence)

  items.forEach((item, index) => {
    const product = workingProducts.get(item.productoId)
    const transaction = prepareInventoryMovement({
      product,
      type: 'SALIDA',
      quantity: Number(item.cantidad),
      reason: 'Venta',
      comments: `Venta ${folio}.`,
      user,
      now,
      id: `mov-${id}-${index + 1}`,
    })
    workingProducts.set(product.id, transaction.updatedProduct)
    movements.push(transaction.movement)
    transaction.movement.referencia = folio
    saleItems.push({
      id: `sitem-${id}-${index + 1}`,
      saleId: id,
      productoId: product.id,
      producto: product.nombre,
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
      subtotal: calculateSaleItemSubtotal(item),
    })
  })

  const firstMovement = movements[0]
  const subtotal = calculateSaleTotal(saleItems)
  const appliedDiscount = Math.min(Math.max(0, Number(discount) || 0), subtotal)
  const total = Math.round((subtotal - appliedDiscount) * 100) / 100
  const sale = {
    id,
    folio,
    fecha: firstMovement.fecha,
    hora: firstMovement.hora,
    usuarioId: user.id,
    usuario: user.nombre,
    rolUsuario: user.rolLabel ?? user.rol,
    subtotal,
    descuento: appliedDiscount,
    total,
    cliente: customer.trim() || null,
    observaciones: observations.trim(),
    metodoPago: paymentMethod,
    detallesPago: paymentDetails,
    estado: 'COMPLETADA',
  }

  return {
    sale,
    saleItems,
    movements,
    products: Array.from(workingProducts.values()),
  }
}
