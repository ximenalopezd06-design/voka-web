import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { ProductForm } from '../components/ProductForm'
import { useProducts } from '../ProductContext'

export function NewProductPage() {
  const navigate = useNavigate()
  const { createProduct } = useProducts()

  function saveProduct(values) {
    createProduct(values)
    navigate('/catalogo', { state: { message: 'Producto creado correctamente.' } })
  }

  return (
    <div className="product-form-page">
      <PageHeader title="Nuevo Producto" description="Agrega un nuevo producto al catálogo de Villa Dulce." />
      <ProductForm submitLabel="Guardar Producto" onSubmit={saveProduct} onCancel={() => navigate('/catalogo')} />
    </div>
  )
}
