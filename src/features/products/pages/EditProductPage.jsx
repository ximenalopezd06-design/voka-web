import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../../../components/layout/PageHeader'
import { ProductForm } from '../components/ProductForm'
import { useProducts } from '../ProductContext'

export function EditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProductById, updateProduct } = useProducts()
  const product = getProductById(id)

  if (!product) return <Navigate to="/catalogo" replace />

  function saveProduct(values) {
    updateProduct(id, values)
    navigate('/catalogo', { state: { message: 'Producto actualizado correctamente.' } })
  }

  return (
    <div className="product-form-page">
      <PageHeader title="Editar Producto" description={`Actualiza la información de ${product.nombre}.`} />
      <ProductForm product={product} submitLabel="Guardar Cambios" onSubmit={saveProduct} onCancel={() => navigate('/catalogo')} />
    </div>
  )
}
