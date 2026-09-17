import { Sparkles } from 'lucide-react'
import { PageHeader } from '../layout/PageHeader'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

export function ComingSoonPage({ title }) {
  return (
    <div className="module-page">
      <PageHeader
        title={title}
        description="Esta sección forma parte de la estructura inicial de Villa Dulce."
        action={<Badge tone="warning">Próxima etapa</Badge>}
      />
      <Card className="placeholder-card">
        <div className="placeholder-card__icon"><Sparkles /></div>
        <h2>Módulo en desarrollo</h2>
        <p>La navegación ya está disponible. Su funcionalidad se implementará progresivamente.</p>
      </Card>
    </div>
  )
}
