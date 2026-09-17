export function StockAlertCard({ product }) {
  const isEmpty = product.stockActual === 0
  const unit = product.unidadVenta === 'Kilogramo' ? 'kg' : product.unidadVenta.toLowerCase()
  const percentage = isEmpty
    ? 0
    : Math.min(100, Math.max(8, (product.stockActual / Math.max(product.stockMinimo * 2, 1)) * 100))

  return (
    <article className={`stock-alert-card stock-alert-card--${isEmpty ? 'critical' : 'low'}`}>
      <div className={`stock-alert-card__image product-image product-image--${product.color}`} aria-hidden="true">
        {product.imagen}
      </div>
      <div className="stock-alert-card__content">
        <div className="stock-alert-card__heading">
          <strong>{product.nombre}</strong>
          <span className="stock-alert-card__dot" />
        </div>
        <div className="stock-alert-card__track" aria-hidden="true">
          <span style={{ width: `${percentage}%` }} />
        </div>
        <small>{isEmpty ? 'Agotado' : `${product.stockActual} ${unit} restantes`}</small>
      </div>
    </article>
  )
}
