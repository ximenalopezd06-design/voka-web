export function MetricCard({ eyebrow, value, detail, tone }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p>{eyebrow}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  )
}
