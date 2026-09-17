import { Badge } from '../../../components/ui/Badge'

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

function formatDate(date) {
  const [year, month, day] = date.split('-')
  return new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(Number(year), Number(month) - 1, Number(day)))
}

export function PurchaseTable({ purchases }) {
  if (!purchases.length) {
    return (
      <div className="catalog-empty">
        <span>🛍️</span>
        <h2>No encontramos compras</h2>
        <p>Prueba con otros filtros o registra una nueva compra.</p>
      </div>
    )
  }

  return (
    <div className="purchase-table-wrap">
      <table className="purchase-table">
        <thead><tr><th>Folio</th><th>Fecha</th><th>Proveedor</th><th>Productos</th><th>Total</th><th>Usuario</th><th>Estado</th></tr></thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td data-label="Folio"><strong className="purchase-folio">{purchase.folio}</strong></td>
              <td data-label="Fecha">{formatDate(purchase.fecha)}</td>
              <td data-label="Proveedor">{purchase.proveedor}</td>
              <td data-label="Productos">{purchase.cantidadProductos}</td>
              <td data-label="Total" className="purchase-total">{currency(purchase.total)}</td>
              <td data-label="Usuario">{purchase.usuario}</td>
              <td data-label="Estado"><Badge tone={purchase.estado === 'COMPLETADA' ? 'success' : 'danger'}>{purchase.estado === 'COMPLETADA' ? 'Completada' : 'Cancelada'}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="product-table__footer">Mostrando {purchases.length} {purchases.length === 1 ? 'compra' : 'compras'}</footer>
    </div>
  )
}
