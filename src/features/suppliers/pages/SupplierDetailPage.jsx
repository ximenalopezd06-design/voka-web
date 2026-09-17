import { ArrowLeft, Mail, MapPin, Pencil, Phone, ReceiptText } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { usePermission } from '../../auth/usePermission'
import { useProducts } from '../../products/ProductContext'
import { getSupplierPurchaseSummary } from '../supplierRules'

function currency(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)
}

export function SupplierDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSupplierById, purchases } = useProducts()
  const supplier = getSupplierById(id)
  const canEdit = usePermission('proveedores', 'edit')

  if (!supplier) return <div className="suppliers-page"><PageHeader title="Proveedor no encontrado" action={<Button icon={ArrowLeft} onClick={() => navigate('/proveedores')}>Volver</Button>} /></div>
  const history = getSupplierPurchaseSummary(id, purchases)

  return (
    <div className="suppliers-page">
      <PageHeader title={supplier.nombre} description="Información general e historial relacionado con el proveedor." action={<div className="page-header-actions"><Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/proveedores')}>Volver</Button>{canEdit && <Button icon={Pencil} onClick={() => navigate(`/proveedores/editar/${id}`)}>Editar</Button>}</div>} />
      <div className="supplier-detail-grid">
        <Card className="supplier-detail-card">
          <div className="supplier-detail-card__heading"><span>{supplier.nombre.slice(0, 2).toUpperCase()}</span><div><h3>{supplier.nombre}</h3><Badge tone={supplier.estado === 'ACTIVO' ? 'success' : 'danger'}>{supplier.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}</Badge></div></div>
          <dl><div><dt>Contacto</dt><dd>{supplier.contacto}</dd></div><div><dt><Phone size={15} /> Teléfono</dt><dd>{supplier.telefono}</dd></div><div><dt><Mail size={15} /> Correo</dt><dd>{supplier.correo || 'Sin correo'}</dd></div><div><dt><MapPin size={15} /> Dirección</dt><dd>{supplier.direccion || 'Sin dirección'}</dd></div><div><dt>RFC</dt><dd>{supplier.rfc || 'No registrado'}</dd></div><div><dt>Creación</dt><dd>{supplier.fechaCreacion}</dd></div><div><dt>Última actualización</dt><dd>{supplier.ultimaActualizacion}</dd></div></dl>
          {supplier.notas && <div className="supplier-detail-notes"><strong>Notas</strong><p>{supplier.notas}</p></div>}
        </Card>
        <div className="supplier-history-column">
          <div className="supplier-metrics"><Card><small>Compras completadas</small><strong>{history.count}</strong></Card><Card><small>Total histórico</small><strong>{currency(history.total)}</strong></Card></div>
          <Card className="supplier-purchases"><div className="form-section-heading"><ReceiptText /><div><h2>Historial de compras</h2><p>Compras vinculadas mediante el ID permanente del proveedor.</p></div></div>
            {history.purchases.length ? <div className="supplier-purchase-list">{history.purchases.map((purchase) => <div key={purchase.id}><div><strong>{purchase.folio}</strong><small>{purchase.fecha} · {purchase.estado}</small></div><b>{currency(purchase.total)}</b></div>)}</div> : <div className="catalog-empty supplier-history-empty"><span>🧾</span><h2>Sin compras registradas</h2><p>Las nuevas compras aparecerán aquí automáticamente.</p></div>}
          </Card>
        </div>
      </div>
    </div>
  )
}
