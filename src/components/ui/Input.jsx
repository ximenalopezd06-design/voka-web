export function Input({ label, error, id, className = '', ...props }) {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      <span className="field__label">{label}</span>
      <input id={id} className={`field__control${error ? ' field__control--error' : ''}`} {...props} />
      {error && <small className="field__error">{error}</small>}
    </label>
  )
}
