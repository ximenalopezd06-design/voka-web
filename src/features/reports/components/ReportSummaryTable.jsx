import { ChevronLeft, ChevronRight, FilterX, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../../../components/ui/Badge'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

export function ReportSummaryTable({ rows }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('TODOS')
  const [page, setPage] = useState(1)
  const perPage = 5
  const filtered = useMemo(() => rows.filter((row) => (!search || row.date.includes(search)) && (status === 'TODOS' || row.status === status)), [rows, search, status])
  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const visible = filtered.slice((Math.min(page, pages) - 1) * perPage, Math.min(page, pages) * perPage)

  function clear() {
    setSearch('')
    setStatus('TODOS')
    setPage(1)
  }

  return <section className="report-table-card">
    <header><div><h2>Resumen por día</h2><p>Detalle consolidado del periodo seleccionado.</p></div><div className="report-table-filters"><label><Search size={17} /><input value={search} placeholder="Buscar fecha..." onChange={(event) => { setSearch(event.target.value); setPage(1) }} /></label><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option value="TODOS">Todos los estados</option><option value="COMPLETO">Completo</option><option value="REVISIÓN">En revisión</option></select><button type="button" title="Limpiar filtros" aria-label="Limpiar filtros" onClick={clear}><FilterX size={18} /></button></div></header>
    <div className="product-table-wrap"><table className="product-table report-summary-table"><thead><tr><th>Fecha</th><th>Ventas</th><th>Artículos vendidos</th><th>Ticket promedio</th><th>Utilidad</th><th>Estado</th></tr></thead><tbody>{visible.map((row) => <tr key={row.id}><td><strong>{row.date}</strong></td><td>{row.sales}</td><td>{row.articles}</td><td>{money(row.averageTicket)}</td><td>{money(row.profit)}</td><td><Badge tone={row.status === 'COMPLETO' ? 'success' : 'warning'}>{row.status === 'COMPLETO' ? 'Completo' : 'En revisión'}</Badge></td></tr>)}</tbody></table></div>
    <footer><span>Mostrando {visible.length} de {filtered.length} registros</span><div><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={16} /></button><strong>{Math.min(page, pages)} / {pages}</strong><button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)}><ChevronRight size={16} /></button></div></footer>
  </section>
}
