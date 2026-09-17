export const mockSales = [
  {
    id: 'sale-001',
    folio: 'V-0001',
    fecha: '2026-07-26',
    hora: '09:15',
    usuarioId: 'user-cashier-001',
    usuario: 'Ximena Lopez',
    subtotal: 50,
    total: 50,
    metodoPago: 'EFECTIVO',
    estado: 'COMPLETADA',
  },
  {
    id: 'sale-002',
    folio: 'V-0002',
    fecha: '2026-07-26',
    hora: '11:40',
    usuarioId: 'user-admin-001',
    usuario: 'Ricardo Vizcarra',
    subtotal: 70,
    total: 70,
    metodoPago: 'TARJETA',
    estado: 'COMPLETADA',
  },
]

export const mockSaleItems = [
  {
    id: 'sitem-001',
    saleId: 'sale-001',
    productoId: 'prod-002',
    producto: 'Paleta de Caramelo',
    cantidad: 10,
    precioUnitario: 5,
    subtotal: 50,
  },
  {
    id: 'sitem-002',
    saleId: 'sale-002',
    productoId: 'prod-003',
    producto: 'Chocolate Especial',
    cantidad: 2,
    precioUnitario: 35,
    subtotal: 70,
  },
]
