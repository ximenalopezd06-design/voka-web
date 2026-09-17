// Solicitudes pendientes/rechazadas de demostración. Los movimientos aplicados viven en mockMovements.
export const mockMovementRequests = [
  {
    id: 'mreq-001',
    date: '2026-07-28',
    time: '12:10',
    createdById: 'user-cashier-001',
    createdByName: 'Ximena Lopez',
    type: 'SALIDA',
    reason: 'Producto dañado',
    productId: 'prod-003',
    productName: 'Chocolate Especial',
    quantity: 1,
    unit: 'Pieza',
    observations: 'Empaque roto durante el acomodo.',
    evidence: [],
    status: 'PENDIENTE',
    audit: [{ action: 'ENVIADO', userId: 'user-cashier-001', userName: 'Ximena Lopez', at: '2026-07-28 12:10' }],
  },
]
