export function validateSupplier(data, suppliers, currentId = null) {
  const errors = {}
  if (!data.nombre?.trim()) errors.nombre = 'El nombre comercial es obligatorio.'
  else if (suppliers.some((item) => item.id !== currentId && item.nombre.trim().toLowerCase() === data.nombre.trim().toLowerCase())) {
    errors.nombre = 'Ya existe un proveedor con este nombre comercial.'
  }
  if (!data.contacto?.trim()) errors.contacto = 'El nombre del contacto es obligatorio.'
  if (!data.telefono?.trim()) errors.telefono = 'El teléfono es obligatorio.'
  if (data.correo?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim())) {
    errors.correo = 'Ingresa un correo electrónico válido.'
  }
  return errors
}

export function filterSuppliers(suppliers, { search, status }) {
  const term = search.trim().toLocaleLowerCase('es')
  return suppliers.filter((supplier) => {
    const matchesSearch = !term || [supplier.nombre, supplier.contacto, supplier.telefono, supplier.rfc]
      .some((value) => value?.toLocaleLowerCase('es').includes(term))
    const matchesStatus = status === 'TODOS' || supplier.estado === status
    return matchesSearch && matchesStatus
  })
}

export function getSupplierPurchaseSummary(supplierId, purchases) {
  const related = purchases.filter((purchase) => (purchase.providerId ?? purchase.proveedorId) === supplierId)
  const completed = related.filter((purchase) => purchase.estado === 'COMPLETADA')
  return {
    purchases: related,
    count: completed.length,
    total: completed.reduce((sum, purchase) => sum + Number(purchase.total), 0),
  }
}
