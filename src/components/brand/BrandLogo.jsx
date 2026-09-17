export function BrandLogo({ compact = false }) {
  return (
    <div className={`brand-logo${compact ? ' brand-logo--compact' : ''}`} aria-label="Villa Dulce">
      <div className="brand-logo__mark" aria-hidden="true">
        <span className="brand-logo__awning">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="brand-logo__shop">VD</span>
      </div>
      <div className="brand-logo__text">
        <strong>Villa Dulce</strong>
      </div>
    </div>
  )
}
