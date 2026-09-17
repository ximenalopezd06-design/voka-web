import { ArrowLeft, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useProducts } from '../../products/ProductContext'
import { validateSupplier } from '../supplierRules'

const EMPTY_FORM = { nombre: '', contacto: '', telefono: '', correo: '', direccion: '', rfc: '', notas: '' }

export function SupplierFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { suppliers, getSupplierById, createSupplier, updateSupplier } = useProducts()
  const supplier = id ? getSupplierById(id) : null
  const [form, setForm] = useState(() => supplier ? Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, supplier[key] ?? ''])) : EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const isEdit = Boolean(supplier)
  const title = isEdit ? 'Editar proveedor' : 'Nuevo proveedor'
  const fields = useMemo(() => [
    ['nombre', 'Nombre comercial *', 'text'],
    ['contacto', 'Nombre del contacto *', 'text'],
    ['telefono', 'Teléfono *', 'tel'],
    ['correo', 'Correo electrónico', 'email'],
    ['direccion', 'Dirección', 'text'],
    ['rfc', 'RFC (opcional)', 'text'],
  ], [])

  function change(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }))
  }

  function submit(event) {
    event.preventDefault()
    const validationErrors = validateSupplier(form, suppliers, supplier?.id)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return
    try {
      if (isEdit) updateSupplier(supplier.id, form)
      else createSupplier(form)
      navigate('/proveedores', { replace: true, state: { message: isEdit ? 'Proveedor actualizado correctamente.' : 'Proveedor creado correctamente.' } })
    } catch (caught) {
      setErrors(caught.validationErrors ?? { form: 'No fue posible guardar el proveedor.' })
    }
  }

  if (id && !supplier) return <div className="suppliers-page"><PageHeader title="Proveedor no encontrado" action={<Button icon={ArrowLeft} onClick={() => navigate('/proveedores')}>Volver</Button>} /></div>

  return (
    <div className="suppliers-page">
      <PageHeader title={title} description={isEdit ? 'Actualiza la información comercial y de contacto.' : 'Registra un nuevo proveedor para futuras compras.'} action={<Button icon={ArrowLeft} className="button--secondary" onClick={() => navigate('/proveedores')}>Volver</Button>} />
      <form className="supplier-form" onSubmit={submit} noValidate>
        <Card className="employee-form__card">
          <h3>Información del proveedor</h3>
          <div className="employee-form__grid">
            {fields.map(([name, label, type]) => <label className="field" key={name}><span className="field__label">{label}</span><input name={name} type={type} value={form[name]} onChange={change} className={errors[name] ? 'field__control--error' : ''} />{errors[name] && <small className="field__error">{errors[name]}</small>}</label>)}
          </div>
          <label className="field supplier-notes"><span className="field__label">Notas</span><textarea name="notas" rows="4" maxLength="500" value={form.notas} onChange={change} placeholder="Información adicional del proveedor..." /><small>{form.notas.length}/500</small></label>
          {errors.form && <p className="purchase-form-error">{errors.form}</p>}
        </Card>
        <div className="employee-form__actions"><Button type="button" icon={X} className="button--secondary" onClick={() => navigate('/proveedores')}>Cancelar</Button><Button type="submit" icon={Save}>Guardar proveedor</Button></div>
      </form>
    </div>
  )
}
