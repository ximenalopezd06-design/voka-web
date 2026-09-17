export function Button({ children, icon: Icon, className = '', ...props }) {
  return (
    <button className={`button ${className}`.trim()} {...props}>
      {Icon && <Icon size={24} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
