const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(value)

export function SalesBarChart({ data }) {
  const maximum = Math.max(...data.map((item) => item.value), 1)
  return <section className="report-chart-card report-bar-chart"><header><div><h2>Ventas por día</h2><p>Comportamiento de los últimos siete días.</p></div></header><div className="report-bars">{data.map((item) => <div key={item.label}><span title={money(item.value)}><i style={{ height: `${Math.max(8, item.value / maximum * 100)}%` }} /></span><strong>{item.label}</strong><small>{money(item.value)}</small></div>)}</div></section>
}

export function CategoryDonutChart({ data }) {
  let accumulated = 0
  const gradient = data.map((item) => {
    const from = accumulated
    accumulated += item.value
    return `${item.color} ${from}% ${accumulated}%`
  }).join(', ')
  return <section className="report-chart-card report-category-chart"><header><div><h2>Ventas por categoría</h2><p>Participación sobre las ventas.</p></div></header><div className="report-donut-layout"><div className="report-donut" style={{ background: `conic-gradient(${gradient})` }}><span><strong>100%</strong><small>Ventas</small></span></div><div className="report-legend">{data.map((item) => <div key={item.label}><i style={{ background: item.color }} /><span>{item.label}</span><strong>{item.value}%</strong></div>)}</div></div></section>
}
