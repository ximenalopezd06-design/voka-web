function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export const PAYMENT_METHODS = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO']

export function calculateSaleItemSubtotal(item) {
  const quantity = Number(item.cantidad)
  const price = Number(item.precioUnitario)
  if (!Number.isFinite(quantity) || !Number.isFinite(price)) return 0
  return roundMoney(quantity * price)
}

export function calculateSaleTotal(items) {
  return roundMoney(items.reduce((total, item) => total + calculateSaleItemSubtotal(item), 0))
}

export function validateSale({ items, paymentMethod, paymentDetails, products, discount = 0 }) {
  const errors = {}
  const itemErrors = {}
  const productsById = new Map(products.map((product) => [product.id, product]))

  if (!items.length) errors.items = 'Agrega al menos un producto a la venta.'
  if (!paymentMethod) errors.paymentMethod = 'Selecciona un método de pago.'
  else if (!PAYMENT_METHODS.includes(paymentMethod)) errors.paymentMethod = 'Selecciona un método de pago válido.'
  const subtotal = calculateSaleTotal(items)
  const discountValue = Number(discount || 0)
  if (!Number.isFinite(discountValue) || discountValue < 0 || discountValue > subtotal) errors.discount = 'El descuento no es válido.'
  const total = Math.max(0, subtotal - (Number.isFinite(discountValue) ? discountValue : 0))
  if (paymentMethod === 'EFECTIVO' && paymentDetails?.cashReceived !== undefined && Number(paymentDetails.cashReceived) < total) {
    errors.payment = 'El monto recibido debe cubrir el total.'
  }
  if (paymentMethod === 'MIXTO') {
    const paid = Number(paymentDetails?.cash || 0) + Number(paymentDetails?.card || 0) + Number(paymentDetails?.transfer || 0)
    if (Math.abs(paid - total) > 0.009) errors.payment = 'La suma de los métodos debe ser igual al total.'
  }

  items.forEach((item) => {
    const product = productsById.get(item.productoId)
    const quantity = Number(item.cantidad)
    const currentErrors = {}
    if (!product || product.estado !== 'ACTIVO') currentErrors.product = 'El producto ya no está disponible.'
    if (item.cantidad === '' || !Number.isFinite(quantity) || quantity <= 0) currentErrors.cantidad = 'La cantidad debe ser mayor que cero.'
    else if (product && quantity > Number(product.stockActual)) currentErrors.cantidad = 'No hay suficiente stock disponible.'
    if (Object.keys(currentErrors).length) itemErrors[item.productoId] = currentErrors
  })

  if (Object.keys(itemErrors).length) errors.itemErrors = itemErrors
  return errors
}

export function localBusinessDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function getDailySalesSummary(sales, saleItems, date = localBusinessDate()) {
  const dailySales = sales.filter((sale) => sale.fecha === date && sale.estado === 'COMPLETADA')
  const ids = new Set(dailySales.map((sale) => sale.id))
  const dailyItems = saleItems.filter((item) => ids.has(item.saleId))
  return {
    sales: dailySales.length,
    revenue: roundMoney(dailySales.reduce((total, sale) => total + sale.total, 0)),
    products: dailyItems.reduce((total, item) => total + Number(item.cantidad), 0),
  }
}

function parseBusinessDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dateKey(date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function getSalesByDay(sales, days = 7, today = localBusinessDate()) {
  const completedSales = sales.filter((sale) => sale.estado === 'COMPLETADA')
  const latestSaleDate = completedSales.reduce((latest, sale) => sale.fecha > latest ? sale.fecha : latest, '')
  // Los mocks pueden pertenecer a una fecha anterior. Hasta que exista actividad
  // actual, la gráfica termina en el último día registrado para seguir siendo útil.
  const endDate = completedSales.some((sale) => sale.fecha === today) || !latestSaleDate ? today : latestSaleDate
  const end = parseBusinessDate(endDate)
  const formatter = new Intl.DateTimeFormat('es-MX', { weekday: 'short' })

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end)
    date.setDate(end.getDate() - (days - index - 1))
    const key = dateKey(date)
    const entries = completedSales.filter((sale) => sale.fecha === key)
    return {
      date: key,
      label: formatter.format(date).replace('.', ''),
      sales: entries.length,
      revenue: roundMoney(entries.reduce((total, sale) => total + Number(sale.total), 0)),
      isToday: key === today,
    }
  })
}
