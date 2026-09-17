export function Select({ label, error, id, children, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      <span className="field__label">{label}</span>
      <select id={id} className={`field__control field__select${error ? ' field__control--error' : ''}`} {...props}>
        {children}
      </select>
      {error && <small className="field__error">{error}</small>}
    </label>
  )
}
