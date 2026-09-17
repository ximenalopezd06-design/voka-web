import { X } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { ProductImage } from '../../products/components/ProductImage'

const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value || 0)

export function ProductSaleDetailModal({ product, onClose }) {
  if (!product) return null
  const outOfStock = Number(product.stockActual) <= 0
  const lowStock = !outOfStock && Number(product.stockActual) <= Number(product.stockMinimo)

  return <div className="product-consult-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="product-sale-detail-modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${product.nombre}`}>
    <header><div><small>Detalle del producto</small><h2>{product.nombre}</h2></div><button type="button" aria-label="Cerrar" onClick={onClose}><X size={20} /></button></header>
    <div className="product-sale-detail__hero">
      <ProductImage product={product} size="large" />
      <div><p>{product.descripcion}</p>{outOfStock ? <Badge tone="danger">Agotado</Badge> : lowStock ? <Badge tone="warning">Stock bajo</Badge> : <Badge tone="success">Disponible</Badge>}</div>
    </div>
    <dl className="product-sale-detail__grid">
      <div><dt>Código de barras</dt><dd>{product.codigoBarras}</dd></div>
      <div><dt>SKU</dt><dd>{product.sku}</dd></div>
      <div><dt>Categoría</dt><dd>{product.categoria}</dd></div>
      <div><dt>Marca</dt><dd>{product.marca}</dd></div>
      <div><dt>Precio de venta</dt><dd>{money(product.precioVenta)}</dd></div>
      <div><dt>Costo</dt><dd>{money(product.costoCompra)}</dd></div>
      <div><dt>Existencias disponibles</dt><dd>{product.stockActual}</dd></div>
      <div><dt>Stock mínimo</dt><dd>{product.stockMinimo}</dd></div>
      <div><dt>Unidad de medida</dt><dd>{product.unidadVenta}</dd></div>
      <div><dt>Ubicación</dt><dd>{product.ubicacion}</dd></div>
      <div><dt>Última fecha de compra</dt><dd>{product.ultimaCompra}</dd></div>
      <div><dt>Proveedor principal</dt><dd>{product.proveedor}</dd></div>
    </dl>
    <footer><Button className="button--secondary" onClick={onClose}>Cerrar</Button></footer>
  </section></div>
}
