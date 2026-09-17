function normalize(value = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function filterProducts(products, { search = '', category = 'TODAS', status = 'TODOS' }) {
  const query = normalize(search)

  return products.filter((product) => {
    const matchesSearch = !query
      || normalize(product.nombre).includes(query)
      || normalize(product.codigoBarras).includes(query)
    const matchesCategory = category === 'TODAS' || product.categoria === category
    const matchesStatus = status === 'TODOS' || product.estado === status
    return matchesSearch && matchesCategory && matchesStatus
  })
}
