import { Bell, Boxes, Building2, DatabaseBackup, Info, KeyRound, MonitorCog, Palette, ReceiptText, Save, Settings2, ShoppingCart, Users } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useCurrentUser } from '../../auth/useCurrentUser'
import { useEmployees } from '../../employees/EmployeeContext'
import { useSettings } from '../SettingsContext'
import { UserManagementSection } from '../components/UserManagementSection'

const sections = [
  ['general', 'General', Settings2], ['company', 'Empresa', Building2], ['users', 'Usuarios y permisos', Users],
  ['sales', 'Ventas', ShoppingCart], ['inventory', 'Inventario', Boxes], ['purchases', 'Compras', ReceiptText],
  ['notifications', 'Notificaciones', Bell], ['appearance', 'Apariencia', Palette], ['backups', 'Respaldos', DatabaseBackup],
  ['system', 'Información del sistema', Info],
]

function Toggle({ label, description, checked, onChange }) {
  return <label className="settings-toggle"><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} /><i /></label>
}

function SectionHeading({ icon: Icon, title, description }) {
  return <div className="settings-card__heading"><Icon /><div><h2>{title}</h2><p>{description}</p></div></div>
}

export function SettingsPage() {
  const location = useLocation()
  const user = useCurrentUser()
  const { changeOwnPassword } = useEmployees()
  const { preferences, updatePreferences, business, updateBusiness, systemSettings, updateSystemSettings } = useSettings()
  const [active, setActive] = useState(location.state?.settingsSection ?? 'general')
  const [forms, setForms] = useState(systemSettings)
  const [businessForm, setBusinessForm] = useState(business)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function changeSection(section, field, value) {
    setForms((current) => ({ ...current, [section]: { ...current[section], [field]: value } }))
  }

  function saveSection(section, label) {
    updateSystemSettings(section, forms[section])
    setMessage(`${label} guardada correctamente.`)
    setError('')
  }

  async function savePassword(event) {
    event.preventDefault()
    try {
      await changeOwnPassword(password, confirmation, user)
      setPassword(''); setConfirmation(''); setMessage('Tu contraseña se actualizó correctamente.'); setError('')
    } catch (caught) { setError(caught.message) }
  }

  return <div className="settings-page settings-center">
    <PageHeader title="Configuración" description="Centro de administración del sistema Villa Dulce." />
    {message && <div className="catalog-toast" role="status">{message}<button type="button" onClick={() => setMessage('')}>×</button></div>}
    {error && <p className="login-error" role="alert">{error}</p>}
    <div className="settings-center-layout">
      <nav className="settings-section-nav" aria-label="Secciones de configuración">{sections.map(([id, label, Icon]) => <button type="button" className={active === id ? 'is-active' : ''} key={id} onClick={() => { setActive(id); setMessage(''); setError('') }}><Icon size={18} /><span>{label}</span></button>)}</nav>
      <main className="settings-section-content">
        {active === 'general' && <Card className="settings-card"><SectionHeading icon={Settings2} title="General" description="Preferencias principales de operación y localización." /><div className="settings-fields-grid">
          <label className="field"><span className="field__label">Nombre del sistema</span><input value={forms.general.systemName} onChange={(e) => changeSection('general', 'systemName', e.target.value)} /></label>
          <label className="field"><span className="field__label">Idioma</span><select value={forms.general.language} onChange={(e) => changeSection('general', 'language', e.target.value)}><option value="es-MX">Español (México)</option><option value="en-US">English</option></select></label>
          <label className="field"><span className="field__label">Moneda</span><select value={forms.general.currency} onChange={(e) => changeSection('general', 'currency', e.target.value)}><option value="MXN">Peso mexicano (MXN)</option><option value="USD">Dólar (USD)</option></select></label>
          <label className="field"><span className="field__label">Zona horaria</span><select value={forms.general.timezone} onChange={(e) => changeSection('general', 'timezone', e.target.value)}><option value="America/Mazatlan">Mazatlán</option><option value="America/Mexico_City">Ciudad de México</option></select></label>
          <label className="field"><span className="field__label">Formato de fecha</span><select value={forms.general.dateFormat} onChange={(e) => changeSection('general', 'dateFormat', e.target.value)}><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></label>
          <label className="field"><span className="field__label">Formato de hora</span><select value={forms.general.timeFormat} onChange={(e) => changeSection('general', 'timeFormat', e.target.value)}><option value="12h">12 horas</option><option value="24h">24 horas</option></select></label>
          <label className="field"><span className="field__label">Número de decimales</span><input type="number" min="0" max="4" value={forms.general.decimals} onChange={(e) => changeSection('general', 'decimals', Number(e.target.value))} /></label>
        </div><Button icon={Save} onClick={() => saveSection('general', 'Configuración general')}>Guardar cambios</Button></Card>}

        {active === 'company' && <Card className="settings-card"><SectionHeading icon={Building2} title="Empresa" description="Datos comerciales reutilizados en tickets, órdenes y documentos." /><div className="settings-company-logo"><span>{businessForm.logo ? <img src={businessForm.logo} alt="Logotipo" /> : '🍭'}</span><label className="field"><span className="field__label">Logotipo (URL o referencia)</span><input value={businessForm.logo} onChange={(e) => setBusinessForm((c) => ({ ...c, logo: e.target.value }))} /></label></div><div className="settings-fields-grid">{[
          ['name','Nombre comercial'], ['legalName','Razón social'], ['rfc','RFC'], ['phone','Teléfono'], ['email','Correo electrónico'], ['address','Dirección'], ['city','Ciudad'], ['state','Estado'], ['postalCode','Código Postal'],
        ].map(([field,label]) => <label className="field" key={field}><span className="field__label">{label}</span><input value={businessForm[field]} onChange={(e) => setBusinessForm((c) => ({ ...c, [field]: e.target.value }))} /></label>)}</div><Button icon={Save} onClick={() => { updateBusiness(businessForm); setMessage('Información de la empresa actualizada.') }}>Actualizar información</Button></Card>}

        {active === 'users' && <div className="settings-users-section"><UserManagementSection onMessage={(value) => { setMessage(value); setError('') }} onError={(value) => { setError(value); setMessage('') }} /><Card className="settings-card settings-own-password"><SectionHeading icon={KeyRound} title="Mi contraseña" description="Actualiza las credenciales de tu perfil Administrador." /><form onSubmit={savePassword}><div className="settings-fields-grid"><label className="field"><span className="field__label">Nueva contraseña</span><input type="password" minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} /></label><label className="field"><span className="field__label">Confirmar contraseña</span><input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label></div><Button icon={KeyRound} type="submit">Cambiar contraseña</Button></form></Card></div>}

        {active === 'sales' && <Card className="settings-card"><SectionHeading icon={ShoppingCart} title="Ventas" description="Reglas operativas del Punto de Venta." /><div className="settings-fields-grid"><label className="field"><span className="field__label">Serie del folio de ventas</span><input value={forms.sales.folioSeries} onChange={(e) => changeSection('sales','folioSeries',e.target.value)} /></label><label className="field"><span className="field__label">Tiempo máximo de venta en espera (minutos)</span><input type="number" min="1" value={forms.sales.holdMinutes} onChange={(e) => changeSection('sales','holdMinutes',Number(e.target.value))} /></label></div><div className="settings-toggle-list"><Toggle label="Vista previa del ticket" description="Mostrar el ticket antes de finalizar." checked={forms.sales.ticketPreview} onChange={(v) => changeSection('sales','ticketPreview',v)} /><Toggle label="Autorización para cancelar ventas" description="Solicitar confirmación administrativa." checked={forms.sales.cancelAuthorization} onChange={(v) => changeSection('sales','cancelAuthorization',v)} /><Toggle label="Permitir descuentos" description="Disponible únicamente para Administradores." checked={forms.sales.allowDiscounts} onChange={(v) => changeSection('sales','allowDiscounts',v)} /><Toggle label="Impresión automática" description="Imprimir el ticket al completar el cobro." checked={forms.sales.autoPrint} onChange={(v) => changeSection('sales','autoPrint',v)} /></div><Button icon={Save} onClick={() => saveSection('sales','Configuración de ventas')}>Guardar cambios</Button></Card>}

        {active === 'inventory' && <Card className="settings-card"><SectionHeading icon={Boxes} title="Inventario" description="Comportamiento de existencias, alertas y ajustes." /><div className="settings-fields-grid"><label className="field"><span className="field__label">Stock mínimo predeterminado</span><input type="number" min="0" value={forms.inventory.defaultMinimumStock} onChange={(e) => changeSection('inventory','defaultMinimumStock',Number(e.target.value))} /></label></div><div className="settings-toggle-list"><Toggle label="Alertas por stock bajo" description="Mostrar productos que requieren reposición." checked={forms.inventory.lowStockAlerts} onChange={(v) => changeSection('inventory','lowStockAlerts',v)} /><Toggle label="Actualización automática" description="Descontar inventario al finalizar una venta." checked={forms.inventory.automaticSaleUpdate} onChange={(v) => changeSection('inventory','automaticSaleUpdate',v)} /><Toggle label="Ajustes manuales" description="Permitir ajustes únicamente al Administrador." checked={forms.inventory.manualAdjustments} onChange={(v) => changeSection('inventory','manualAdjustments',v)} /></div><Button icon={Save} onClick={() => saveSection('inventory','Configuración de inventario')}>Guardar cambios</Button></Card>}

        {active === 'purchases' && <Card className="settings-card"><SectionHeading icon={ReceiptText} title="Compras" description="Reglas del flujo de solicitudes y proveedores." /><div className="settings-fields-grid"><label className="field"><span className="field__label">Serie de solicitudes</span><input value={forms.purchases.requestSeries} onChange={(e) => changeSection('purchases','requestSeries',e.target.value)} /></label><label className="field"><span className="field__label">Días para sugerir revisión de borrador</span><input type="number" min="1" value={forms.purchases.draftReviewDays} onChange={(e) => changeSection('purchases','draftReviewDays',Number(e.target.value))} /></label></div><div className="settings-toggle-list"><Toggle label="Requerir aprobación" description="Todas las solicitudes pasan por el Administrador." checked={forms.purchases.requireApproval} onChange={(v) => changeSection('purchases','requireApproval',v)} /><Toggle label="Correo automático al proveedor" description="Enviar después de aprobar la solicitud." checked={forms.purchases.autoEmailProvider} onChange={(v) => changeSection('purchases','autoEmailProvider',v)} /></div><Button icon={Save} onClick={() => saveSection('purchases','Configuración de compras')}>Guardar cambios</Button></Card>}

        {active === 'notifications' && <Card className="settings-card"><SectionHeading icon={Bell} title="Notificaciones" description="Selecciona los avisos visibles en el centro de notificaciones." /><div className="settings-toggle-list"><Toggle label="Productos con stock bajo" description="Avisar cuando un producto alcance su mínimo." checked={preferences.notifications.lowStock} onChange={(v) => updatePreferences({ notifications: { lowStock:v } })} /><Toggle label="Nuevas solicitudes de compra" description="Avisar al recibir solicitudes pendientes." checked={preferences.notifications.purchaseRequests} onChange={(v) => updatePreferences({ notifications: { purchaseRequests:v } })} /><Toggle label="Compras aprobadas" description="Avisar cambios a estado aprobado." checked={preferences.notifications.requestApproved} onChange={(v) => updatePreferences({ notifications: { requestApproved:v } })} /><Toggle label="Compras rechazadas" description="Avisar rechazos y observaciones." checked={preferences.notifications.requestRejected} onChange={(v) => updatePreferences({ notifications: { requestRejected:v } })} /><Toggle label="Errores del sistema" description="Mostrar incidentes técnicos relevantes." checked={preferences.notifications.systemErrors ?? true} onChange={(v) => updatePreferences({ notifications: { systemErrors:v } })} /></div></Card>}

        {active === 'appearance' && <Card className="settings-card"><SectionHeading icon={Palette} title="Apariencia" description="Personaliza la presentación visual del sistema." /><div className="settings-fields-grid"><label className="field"><span className="field__label">Modo visual</span><select value={preferences.theme} onChange={(e) => updatePreferences({ theme:e.target.value })}><option value="light">Modo claro</option><option value="dark">Modo oscuro</option><option value="auto">Automático</option></select></label><label className="field"><span className="field__label">Tamaño de letra</span><select value={preferences.fontSize} onChange={(e) => updatePreferences({ fontSize:e.target.value })}><option value="small">Pequeño</option><option value="medium">Mediano</option><option value="large">Grande</option></select></label><label className="field"><span className="field__label">Color institucional</span><input type="color" value={forms.appearance.institutionalColor} onChange={(e) => changeSection('appearance','institutionalColor',e.target.value)} /></label></div><Toggle label="Animaciones del sistema" description="Activar transiciones y movimientos suaves." checked={forms.appearance.animations} onChange={(v) => changeSection('appearance','animations',v)} /><Button icon={Save} onClick={() => saveSection('appearance','Configuración de apariencia')}>Guardar cambios</Button></Card>}

        {active === 'backups' && <Card className="settings-card"><SectionHeading icon={DatabaseBackup} title="Respaldos" description="Interfaz preparada para el futuro servicio de copias de seguridad." /><div className="settings-backup-status"><DatabaseBackup /><div><span>Último respaldo</span><strong>{forms.backups.lastBackup}</strong></div><Badge tone="success">Completado</Badge></div><label className="field"><span className="field__label">Frecuencia de respaldos</span><select value={forms.backups.frequency} onChange={(e) => changeSection('backups','frequency',e.target.value)}><option value="daily">Diario</option><option value="weekly">Semanal</option><option value="monthly">Mensual</option></select></label><div className="settings-backup-actions"><Button icon={DatabaseBackup} onClick={() => setMessage('Respaldo simulado realizado correctamente.')}>Realizar respaldo</Button><Button className="button--secondary" onClick={() => setMessage('Restauración preparada para conectar con el servicio de respaldos.')}>Restaurar respaldo</Button></div></Card>}

        {active === 'system' && <Card className="settings-card"><SectionHeading icon={MonitorCog} title="Información del sistema" description="Estado técnico y datos de la instalación actual." /><dl className="settings-system-info"><div><dt>Versión del sistema</dt><dd>Villa Dulce 1.0.0</dd></div><div><dt>Fecha de instalación</dt><dd>01/07/2026</dd></div><div><dt>Última actualización</dt><dd>31/07/2026</dd></div><div><dt>Estado de la base de datos</dt><dd><Badge tone="success">Operativa</Badge></dd></div><div><dt>Estado del servidor</dt><dd><Badge tone="success">En línea</Badge></dd></div><div><dt>Licencia</dt><dd>Villa Dulce · Comercial activa</dd></div></dl></Card>}
      </main>
    </div>
  </div>
}
