export function Badge({ children, tone = 'info', className = '' }) {
  return <span className={`badge badge--${tone} ${className}`.trim()}>{children}</span>
}
