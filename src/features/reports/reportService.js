import { mockReportDashboard } from '../../data/mockReports'

// Punto único de acceso preparado para sustituirse por una petición HTTP a PostgreSQL.
export async function getReportDashboard(period = 'month') {
  return structuredClone({ ...mockReportDashboard, period, generatedAt: new Date().toISOString() })
}
