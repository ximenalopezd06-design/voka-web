import { ImagePlus, Info, PackageOpen, Save, ShoppingBag, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { EMPTY_PRODUCT, PRODUCT_CATEGORIES, SALE_UNITS } from '../productConstants'
import { ProductImage } from './ProductImage'

function validateProduct(values) {
  const errors = {}
  if (!values.nombre.trim()) errors.nombre = 'Ingresa el nombre del producto.'
  if (!values.codigoBarras.trim()) errors.codigoBarras = 'Ingresa el código de barras.'
  if (!values.categoria) errors.categoria = 'Selecciona una categoría.'
  if (!values.unidadVenta) errors.unidadVenta = 'Selecciona una unidad de venta.'
  if (values.precioVenta === '' || Number(values.precioVenta) <= 0) errors.precioVenta = 'Ingresa un precio mayor a cero.'
  if (values.stockMinimo === '' || Number(values.stockMinimo) < 0) errors.stockMinimo = 'El stock mínimo no puede ser negativo.'
  if (values.costoCompra !== '' && Number(values.costoCompra) < 0) errors.costoCompra = 'El costo no puede ser negativo.'
  return errors
}

export function ProductForm({ product, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(() => ({ ...EMPTY_PRODUCT, ...product }))
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function selectImage(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, imagen: 'Selecciona un archivo de imagen válido.' }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setValues((current) => ({ ...current, imagen: reader.result }))
      setErrors((current) => ({ ...current, imagen: undefined }))
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateProduct(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      nombre: values.nombre.trim(),
      imagen: values.imagen,
      codigoBarras: values.codigoBarras.trim(),
      categoria: values.categoria,
      marca: values.marca.trim(),
      descripcion: values.descripcion.trim(),
      unidadVenta: values.unidadVenta,
      precioVenta: Number(values.precioVenta),
      stockMinimo: Number(values.stockMinimo),
      proveedor: values.proveedor.trim(),
      costoCompra: values.costoCompra === '' ? 0 : Number(values.costoCompra),
    })
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <Card className="product-form__section product-form__section--basic">
        <div className="form-section-heading">
          <Info size={21} />
          <div>
            <h2>Información básica</h2>
            <p>Datos que identifican el producto dentro del catálogo.</p>
          </div>
        </div>

        <div className="product-form__basic-grid">
          <div className="image-uploader">
            <span className="field__label">Imagen del producto</span>
            <button type="button" className="image-uploader__preview" onClick={() => fileInputRef.current?.click()}>
              {values.imagen
                ? <ProductImage product={{ ...values, color: product?.color }} size="large" />
                : <><ImagePlus size={34} /><strong>Agregar imagen</strong><small>PNG o JPG</small></>}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={selectImage} hidden />
            {errors.imagen && <small className="field__error">{errors.imagen}</small>}
          </div>

          <div className="product-form__fields">
            <Input id="nombre" name="nombre" label="Nombre del producto *" value={values.nombre} error={errors.nombre} onChange={updateField} placeholder="Ej. Gomitas de Pandita" />
            <Input id="codigoBarras" name="codigoBarras" label="Código de barras *" value={values.codigoBarras} error={errors.codigoBarras} onChange={updateField} placeholder="Ej. 7501001000011" inputMode="numeric" />
            <Select id="categoria" name="categoria" label="Categoría *" value={values.categoria} error={errors.categoria} onChange={updateField}>
              <option value="">Selecciona una categoría</option>
              {PRODUCT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </Select>
            <Input id="marca" name="marca" label="Marca" value={values.marca} onChange={updateField} placeholder="Ej. Ricolino" />
            <label className="field product-form__description" htmlFor="descripcion">
              <span className="field__label">Descripción</span>
              <textarea id="descripcion" name="descripcion" className="field__control" value={values.descripcion} onChange={updateField} placeholder="Describe el producto..." rows="4" />
            </label>
          </div>
        </div>
      </Card>

      <div className="product-form__columns">
        <Card className="product-form__section">
          <div className="form-section-heading">
            <ShoppingBag size={21} />
            <div><h2>Configuración de venta</h2><p>Unidad y precio para vender el producto.</p></div>
          </div>
          <div className="product-form__fields">
            <Select id="unidadVenta" name="unidadVenta" label="Unidad de venta *" value={values.unidadVenta} error={errors.unidadVenta} onChange={updateField}>
              <option value="">Selecciona una unidad</option>
              {SALE_UNITS.map((unit) => <option key={unit}>{unit}</option>)}
            </Select>
            <Input id="precioVenta" name="precioVenta" type="number" min="0" step="0.01" label="Precio de venta *" value={values.precioVenta} error={errors.precioVenta} onChange={updateField} placeholder="0.00" />
            <Input id="stockMinimo" name="stockMinimo" type="number" min="0" step="0.001" label="Stock mínimo *" value={values.stockMinimo} error={errors.stockMinimo} onChange={updateField} placeholder="0" />
          </div>
          <div className="stock-readonly-notice">
            <PackageOpen size={20} />
            <p><strong>El stock actual no se edita aquí.</strong> Las existencias se registrarán mediante movimientos de inventario.</p>
          </div>
        </Card>

        <Card className="product-form__section">
          <div className="form-section-heading">
            <PackageOpen size={21} />
            <div><h2>Compra</h2><p>Información del proveedor y costo.</p></div>
          </div>
          <div className="product-form__fields">
            <Input id="proveedor" name="proveedor" label="Proveedor principal" value={values.proveedor} onChange={updateField} placeholder="Ej. Dulcería Central" />
            <Input id="costoCompra" name="costoCompra" type="number" min="0" step="0.01" label="Costo de compra" value={values.costoCompra} error={errors.costoCompra} onChange={updateField} placeholder="0.00" />
          </div>
        </Card>
      </div>

      <div className="product-form__actions">
        <Button type="button" icon={X} className="button--secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" icon={Save}>{submitLabel}</Button>
      </div>
    </form>
  )
}
