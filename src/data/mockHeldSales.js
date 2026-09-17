export const mockHeldSales = [
  {
    id: 'held-demo-001', number: 1, folio: 'VE-0001', status: 'EN_ESPERA',
    userId: 'user-cashier-001', userName: 'Ximena Lopez', customer: 'Cliente mostrador',
    discount: 0, observations: 'Entregar en bolsa separada.', createdAt: '2026-07-29 10:15',
    items: [
      { productoId: 'prod-001', producto: 'Gomitas Enchiladas', cantidad: 1, precioUnitario: 100, step: .001 },
      { productoId: 'prod-002', producto: 'Paleta de Caramelo', cantidad: 1, precioUnitario: 25, step: 1 },
      { productoId: 'prod-003', producto: 'Chocolate Especial', cantidad: 1, precioUnitario: 120, step: 1 },
    ],
  },
  {
    id: 'held-demo-002', number: 2, folio: 'VE-0002', status: 'EN_ESPERA',
    userId: 'user-cashier-001', userName: 'Ximena Lopez', customer: 'Mariana Torres',
    discount: 20, observations: '', createdAt: '2026-07-29 10:31',
    items: [
      { productoId: 'prod-001', producto: 'Gomitas Enchiladas', cantidad: 3, precioUnitario: 180, step: .001 },
      { productoId: 'prod-002', producto: 'Paleta de Caramelo', cantidad: 4, precioUnitario: 5, step: 1 },
      { productoId: 'prod-003', producto: 'Chocolate Especial', cantidad: 1, precioUnitario: 90, step: 1 },
    ],
  },
  {
    id: 'held-demo-003', number: 3, folio: 'VE-0003', status: 'EN_ESPERA',
    userId: 'user-cashier-001', userName: 'Ximena Lopez', customer: '',
    discount: 0, observations: '', createdAt: '2026-07-29 10:47',
    items: [{ productoId: 'prod-002', producto: 'Paleta de Caramelo', cantidad: 1, precioUnitario: 38, step: 1 }],
  },
]
