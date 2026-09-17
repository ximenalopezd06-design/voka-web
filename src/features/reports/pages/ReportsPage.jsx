import { Download, FileSpreadsheet, FileText, Printer, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { ReportKpis } from '../components/ReportKpis'
import { CategoryDonutChart, SalesBarChart } from '../components/ReportCharts'
import { ReportSummaryTable } from '../components/ReportSummaryTable'
import { ReportShortcuts } from '../components/ReportShortcuts'
import { getReportDashboard } from '../reportService'

export function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [customDates, setCustomDates] = useState({ from: '', to: '' })
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')

  async function load() {
    setLoading(true)
    setDashboard(await getReportDashboard(period === 'custom' ? { ...customDates } : period))
    setLoading(false)
    setNotice('Reporte actualizado correctamente.')
  }

  useEffect(() => {
    let active = true
    getReportDashboard(period).then((data) => { if (active) { setDashboard(data); setLoading(false) } })
    return () => { active = false }
  }, [])

  function simulatedExport(format) {
    setNotice(`Exportación a ${format} preparada para conectar con el servicio de reportes.`)
  }

  return <div className="reports-page">
    <PageHeader title="Reportes" description="Consulta el comportamiento de ventas, inventario, compras y desempeño del negocio." action={<div className="reports-header-actions"><label><span>Periodo</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="today">Hoy</option><option value="week">Esta semana</option><option value="month">Este mes</option><option value="year">Este año</option><option value="custom">Personalizado</option></select></label><Button icon={RefreshCw} className="button--secondary" onClick={load}>Actualizar</Button><Button icon={Download} onClick={() => simulatedExport('archivo')}>Exportar</Button></div>} />
    {period === 'custom' && <div className="reports-custom-period"><label><span>Fecha inicial</span><input type="date" value={customDates.from} max={customDates.to || undefined} onChange={(event) => setCustomDates((current) => ({ ...current, from: event.target.value }))} /></label><label><span>Fecha final</span><input type="date" value={customDates.to} min={customDates.from || undefined} onChange={(event) => setCustomDates((current) => ({ ...current, to: event.target.value }))} /></label></div>}
    {notice && <div className="catalog-toast" role="status">{notice}<button type="button" aria-label="Cerrar mensaje" onClick={() => setNotice('')}>×</button></div>}
    {loading || !dashboard ? <div className="reports-loading"><RefreshCw className="is-spinning" /><span>Preparando indicadores...</span></div> : <>
      <ReportKpis items={dashboard.kpis} />
      <div className="report-charts-grid"><SalesBarChart data={dashboard.dailySales} /><CategoryDonutChart data={dashboard.categorySales} /></div>
      <ReportSummaryTable rows={dashboard.dailySummary} />
      <ReportShortcuts items={dashboard.shortcuts} onOpen={(item) => setNotice(`${item.title} está preparado para su futura fuente de datos.`)} />
      <section className="report-export-card"><div><h2>Exportación de reportes</h2><p>Interfaz preparada para servicios de generación de archivos e impresión.</p></div><div><Button icon={FileSpreadsheet} className="button--secondary" onClick={() => simulatedExport('Excel')}>Exportar a Excel</Button><Button icon={FileText} className="button--secondary" onClick={() => simulatedExport('PDF')}>Exportar a PDF</Button><Button icon={Printer} className="button--secondary" onClick={() => simulatedExport('impresión')}>Imprimir reporte</Button></div></section>
    </>}
  </div>
}
