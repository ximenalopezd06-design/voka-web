import { createContext, useContext, useMemo, useState } from 'react'
import { mockMovements } from '../../data/mockMovements'
import { mockProducts } from '../../data/mockProducts'
import { mockPurchaseItems, mockPurchases } from '../../data/mockPurchases'
import { mockSaleItems, mockSales } from '../../data/mockSales'
import { mockSuppliers } from '../../data/mockSuppliers'
import { mockPurchaseRequests } from '../../data/mockPurchaseRequests'
import { mockMovementRequests } from '../../data/mockMovementRequests'
import { mockHeldSales } from '../../data/mockHeldSales'
import { prepareInventoryMovement } from '../inventory/services/inventoryMovementService'
import { preparePurchase } from '../purchases/services/purchaseService'
import { prepareSale } from '../sales/services/saleService'
import { useAuth } from '../auth/AuthContext'
import { hasPermission } from '../../utils/permissions'
import { validateSupplier } from '../suppliers/supplierRules'
import {
  approvePurchaseRequest,
  prepareOrderForEmail,
  preparePurchaseRequest,
  receivePurchaseOrder,
  rejectPurchaseRequest,
} from '../purchases/services/purchaseRequestService'
import { calculateRequestTotal, canEditRequest, validatePurchaseRequest } from '../purchases/requestRules'
import { applyApprovedMovement, prepareMovementRequest, rejectMovementRequest } from '../inventory/movements/services/movementApprovalService'
import { validateMovementRequest } from '../inventory/movements/movementRequestRules'

const ProductContext = createContext(null)

function createProductId() {
  return `prod-${Date.now().toString(36)}`
}

export function ProductProvider({ children }) {
  const { currentUser } = useAuth()
  const [store, setStore] = useState({
    products: mockProducts,
    movements: mockMovements,
    suppliers: mockSuppliers,
    purchases: mockPurchases,
    purchaseItems: mockPurchaseItems,
    purchaseRequests: mockPurchaseRequests,
    sales: mockSales,
    saleItems: mockSaleItems,
    cashEntries: [],
    heldSales: mockHeldSales,
    movementRequests: mockMovementRequests,
  })

  const value = useMemo(() => ({
    products: store.products,
    movements: store.movements,
    suppliers: store.suppliers,
    purchases: store.purchases,
    purchaseItems: store.purchaseItems,
    purchaseRequests: store.purchaseRequests,
    sales: store.sales,
    saleItems: store.saleItems,
    cashEntries: store.cashEntries,
    heldSales: store.heldSales,
    movementRequests: store.movementRequests,
    getProductById: (id) => store.products.find((product) => product.id === id),
    getSupplierById: (id) => store.suppliers.find((supplier) => supplier.id === id),
    getPurchaseRequestById: (id) => store.purchaseRequests.find((request) => request.id === id),
    getMovementRequestById: (id) => store.movementRequests.find((request) => request.id === id),
    createMovementRequest: (data, status = 'BORRADOR') => {
      if (!hasPermission(currentUser, 'movimientos', 'create')) throw new Error('FORBIDDEN')
      const product = store.products.find((item) => item.id === data.productId)
      const request = prepareMovementRequest({ data, product, user: currentUser, status })
      setStore((current) => ({ ...current, movementRequests: [request, ...current.movementRequests] }))
      return request
    },
    submitMovementRequest: (id) => {
      const request = store.movementRequests.find((item) => item.id === id)
      if (!request || request.createdById !== currentUser?.id || request.status !== 'BORRADOR') throw new Error('FORBIDDEN')
      const at = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
      setStore((current) => ({ ...current, movementRequests: current.movementRequests.map((item) => item.id === id ? { ...item, status: 'PENDIENTE', audit: [...item.audit, { action: 'ENVIADO', userId: currentUser.id, userName: currentUser.nombre, at }] } : item) }))
    },
    approveMovementRequest: (id) => {
      if (!hasPermission(currentUser, 'movimientos', 'manage')) throw new Error('FORBIDDEN')
      const request = store.movementRequests.find((item) => item.id === id)
      if (request?.status !== 'PENDIENTE') throw new Error('La solicitud ya no está pendiente.')
      const product = store.products.find((item) => item.id === request.productId)
      const transaction = applyApprovedMovement({ request, product, approver: currentUser })
      setStore((current) => ({
        ...current,
        products: current.products.map((item) => item.id === transaction.updatedProduct.id ? transaction.updatedProduct : item),
        movements: [transaction.movement, ...current.movements],
        movementRequests: current.movementRequests.map((item) => item.id === id ? transaction.request : item),
        purchaseRequests: request.orderRequestId ? current.purchaseRequests.map((item) => item.id === request.orderRequestId ? {
          ...item,
          status: 'RECIBIDA',
          receivedById: currentUser.id,
          receivedByName: currentUser.nombre,
          receivedAt: transaction.request.approvedAt,
          order: { ...item.order, status: 'RECIBIDA' },
          audit: [...item.audit, { action: 'RECIBIDA_POR_MOVIMIENTO', userId: currentUser.id, userName: currentUser.nombre, at: transaction.request.approvedAt }],
        } : item) : current.purchaseRequests,
      }))
      return transaction.request
    },
    updateMovementRequest: (id, changes) => {
      if (!hasPermission(currentUser, 'movimientos', 'manage')) throw new Error('FORBIDDEN')
      const request = store.movementRequests.find((item) => item.id === id)
      if (request?.status !== 'PENDIENTE') throw new Error('Solo se pueden editar movimientos pendientes.')
      const product = store.products.find((item) => item.id === request.productId)
      const data = { ...request, ...changes, quantity: changes.quantity ?? request.quantity }
      const errors = validateMovementRequest(data, product)
      if (Object.keys(errors).length) {
        const error = new Error('INVALID_MOVEMENT_REQUEST')
        error.validationErrors = errors
        throw error
      }
      const at = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
      setStore((current) => ({ ...current, movementRequests: current.movementRequests.map((item) => item.id === id ? {
        ...item,
        quantity: Number(data.quantity),
        observations: data.observations?.trim() ?? item.observations,
        audit: [...item.audit, { action: 'EDITADO_POR_ADMIN', userId: currentUser.id, userName: currentUser.nombre, at }],
      } : item) }))
    },
    rejectMovementRequestById: (id, reason) => {
      if (!hasPermission(currentUser, 'movimientos', 'manage')) throw new Error('FORBIDDEN')
      const request = store.movementRequests.find((item) => item.id === id)
      if (request?.status !== 'PENDIENTE') throw new Error('La solicitud ya no está pendiente.')
      const rejected = rejectMovementRequest(request, reason, currentUser)
      setStore((current) => ({ ...current, movementRequests: current.movementRequests.map((item) => item.id === id ? rejected : item) }))
      return rejected
    },
    createPurchaseRequest: (data, status = 'BORRADOR') => {
      if (!hasPermission(currentUser, 'compras', 'create')) throw new Error('FORBIDDEN')
      const supplier = store.suppliers.find((item) => item.id === data.providerId)
      if (status !== 'BORRADOR' && (!supplier || supplier.estado !== 'ACTIVO')) throw new Error('El proveedor seleccionado no está disponible.')
      if (supplier && supplier.estado !== 'ACTIVO') throw new Error('El proveedor seleccionado no está disponible.')
      const request = preparePurchaseRequest({ data, supplier, user: currentUser, sequence: store.purchaseRequests.length + 1, status })
      setStore((current) => ({ ...current, purchaseRequests: [request, ...current.purchaseRequests] }))
      return request
    },
    updatePurchaseRequest: (id, data, submit = false) => {
      const request = store.purchaseRequests.find((item) => item.id === id)
      const isOwner = request?.requesterId === currentUser?.id
      const isManager = hasPermission(currentUser, 'compras', 'manage')
      if (!request || (!isOwner && !isManager) || !canEditRequest(request)) throw new Error('FORBIDDEN')
      const errors = submit ? validatePurchaseRequest(data) : {}
      if (Object.keys(errors).length) {
        const error = new Error('INVALID_REQUEST')
        error.validationErrors = errors
        throw error
      }
      const supplier = store.suppliers.find((item) => item.id === data.providerId)
      if (submit && (!supplier || supplier.estado !== 'ACTIVO')) throw new Error('El proveedor seleccionado no está disponible.')
      if (supplier && supplier.estado !== 'ACTIVO') throw new Error('El proveedor seleccionado no está disponible.')
      const at = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
      setStore((current) => ({
        ...current,
        purchaseRequests: current.purchaseRequests.map((item) => item.id === id ? {
          ...item,
          date: data.date,
          providerId: supplier?.id || null,
          providerName: supplier?.nombre || 'Sin seleccionar',
          providerEmail: supplier?.correo || '',
          items: data.items.map((entry) => ({ ...entry, quantity: Number(entry.quantity), estimatedCost: entry.estimatedCost === '' ? 0 : Number(entry.estimatedCost) })),
          notes: data.notes?.trim() || '',
          priority: data.priority || item.priority || 'NORMAL',
          estimatedTotal: calculateRequestTotal(data.items),
          updatedAt: at,
          status: submit ? 'PENDIENTE' : item.status,
          submittedAt: submit ? at : item.submittedAt,
          audit: submit ? [...item.audit, { action: 'ENVIADA_A_APROBACION', userId: currentUser.id, userName: currentUser.nombre, at }] : item.audit,
        } : item),
      }))
    },
    deletePurchaseDraft: (id) => {
      const request = store.purchaseRequests.find((item) => item.id === id)
      const isOwner = request?.requesterId === currentUser?.id
      const isManager = hasPermission(currentUser, 'compras', 'manage')
      if (!request || request.status !== 'BORRADOR' || (!isOwner && !isManager)) throw new Error('FORBIDDEN')
      setStore((current) => ({ ...current, purchaseRequests: current.purchaseRequests.filter((item) => item.id !== id) }))
    },
    cancelPurchaseRequest: (id) => {
      const request = store.purchaseRequests.find((item) => item.id === id)
      const isOwner = request?.requesterId === currentUser?.id
      const isManager = hasPermission(currentUser, 'compras', 'manage')
      if (!request || (!isOwner && !isManager) || !['BORRADOR', 'PENDIENTE'].includes(request.status)) throw new Error('FORBIDDEN')
      const at = new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16)
      setStore((current) => ({
        ...current,
        purchaseRequests: current.purchaseRequests.map((item) => item.id === id ? {
          ...item,
          status: 'CANCELADA',
          cancelledAt: at,
          audit: [...item.audit, { action: 'CANCELADA', userId: currentUser.id, userName: currentUser.nombre, at }],
        } : item),
      }))
    },
    approveRequest: (id) => {
      if (!hasPermission(currentUser, 'compras', 'manage')) throw new Error('FORBIDDEN')
      const request = store.purchaseRequests.find((item) => item.id === id)
      if (request?.status !== 'PENDIENTE') throw new Error('La solicitud ya no está pendiente.')
      const approved = approvePurchaseRequest(request, currentUser, store.purchaseRequests.filter((item) => item.order).length + 1)
      setStore((current) => ({ ...current, purchaseRequests: current.purchaseRequests.map((item) => item.id === id ? approved : item) }))
      return approved
    },
    rejectRequest: (id, reason) => {
      if (!hasPermission(currentUser, 'compras', 'manage')) throw new Error('FORBIDDEN')
      const request = store.purchaseRequests.find((item) => item.id === id)
      if (request?.status !== 'PENDIENTE') throw new Error('La solicitud ya no está pendiente.')
      const rejected = rejectPurchaseRequest(request, reason, currentUser)
      setStore((current) => ({ ...current, purchaseRequests: current.purchaseRequests.map((item) => item.id === id ? rejected : item) }))
      return rejected
    },
    prepareRequestEmail: (id) => {
      if (!hasPermission(currentUser, 'compras', 'manage')) throw new Error('FORBIDDEN')
      const request = store.purchaseRequests.find((item) => item.id === id)
      if (request?.status !== 'APROBADA') throw new Error('La orden no está lista para preparar el envío.')
      const prepared = prepareOrderForEmail(request, currentUser)
      setStore((current) => ({ ...current, purchaseRequests: current.purchaseRequests.map((item) => item.id === id ? prepared : item) }))
      return prepared
    },
    receiveRequest: (id, quantities) => {
      if (!hasPermission(currentUser, 'compras', 'manage')) throw new Error('FORBIDDEN')
      const request = store.purchaseRequests.find((item) => item.id === id)
      if (!request?.order || request.status === 'RECIBIDA') throw new Error('La orden no está disponible para recepción.')
      const transaction = receivePurchaseOrder({ request, products: store.products, quantities, user: currentUser })
      setStore((current) => ({
        ...current,
        products: transaction.products,
        movements: [...transaction.movements, ...current.movements],
        purchaseRequests: current.purchaseRequests.map((item) => item.id === id ? transaction.request : item),
      }))
      return transaction.request
    },
    createSupplier: (supplierData) => {
      if (!hasPermission(currentUser, 'proveedores', 'create')) throw new Error('FORBIDDEN')
      const validationErrors = validateSupplier(supplierData, store.suppliers)
      if (Object.keys(validationErrors).length) {
        const error = new Error('INVALID_SUPPLIER')
        error.validationErrors = validationErrors
        throw error
      }
      const date = new Date().toISOString().slice(0, 10)
      const supplier = {
        ...supplierData,
        id: `sup-${Date.now().toString(36)}`,
        nombre: supplierData.nombre.trim(),
        contacto: supplierData.contacto.trim(),
        telefono: supplierData.telefono.trim(),
        correo: (supplierData.correo ?? '').trim(),
        direccion: (supplierData.direccion ?? '').trim(),
        rfc: (supplierData.rfc ?? '').trim().toUpperCase(),
        notas: (supplierData.notas ?? '').trim(),
        estado: 'ACTIVO',
        fechaCreacion: date,
        ultimaActualizacion: date,
      }
      setStore((current) => ({ ...current, suppliers: [supplier, ...current.suppliers] }))
      return supplier
    },
    updateSupplier: (id, supplierData) => {
      if (!hasPermission(currentUser, 'proveedores', 'edit')) throw new Error('FORBIDDEN')
      const validationErrors = validateSupplier(supplierData, store.suppliers, id)
      if (Object.keys(validationErrors).length) {
        const error = new Error('INVALID_SUPPLIER')
        error.validationErrors = validationErrors
        throw error
      }
      setStore((current) => ({
        ...current,
        suppliers: current.suppliers.map((supplier) => supplier.id === id ? {
          ...supplier,
          ...supplierData,
          id: supplier.id,
          estado: supplier.estado,
          nombre: supplierData.nombre.trim(),
          contacto: supplierData.contacto.trim(),
          telefono: supplierData.telefono.trim(),
          correo: (supplierData.correo ?? '').trim(),
          direccion: (supplierData.direccion ?? '').trim(),
          rfc: (supplierData.rfc ?? '').trim().toUpperCase(),
          notas: (supplierData.notas ?? '').trim(),
          ultimaActualizacion: new Date().toISOString().slice(0, 10),
        } : supplier),
      }))
    },
    toggleSupplierStatus: (id) => {
      if (!hasPermission(currentUser, 'proveedores', 'manage')) throw new Error('FORBIDDEN')
      setStore((current) => ({
        ...current,
        suppliers: current.suppliers.map((supplier) => supplier.id === id ? {
          ...supplier,
          estado: supplier.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO',
          ultimaActualizacion: new Date().toISOString().slice(0, 10),
        } : supplier),
      }))
    },
    createProduct: (productData) => {
      if (!hasPermission(currentUser, 'catalogo', 'create')) throw new Error('FORBIDDEN')
      const product = {
        ...productData,
        id: createProductId(),
        stockActual: 0,
        estado: 'ACTIVO',
      }
      setStore((current) => ({ ...current, products: [product, ...current.products] }))
      return product
    },
    updateProduct: (id, productData) => {
      if (!hasPermission(currentUser, 'catalogo', 'edit')) throw new Error('FORBIDDEN')
      setStore((current) => ({
        ...current,
        products: current.products.map((product) => (
          product.id === id
            ? { ...product, ...productData, id: product.id, stockActual: product.stockActual, estado: product.estado }
            : product
        )),
      }))
    },
    toggleProductStatus: (id) => {
      if (!hasPermission(currentUser, 'catalogo', 'edit')) throw new Error('FORBIDDEN')
      setStore((current) => ({
        ...current,
        products: current.products.map((product) => (
          product.id === id
            ? { ...product, estado: product.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' }
            : product
        )),
      }))
    },
    registerInventoryMovement: (movementData, user) => {
      if (!hasPermission(currentUser, 'movimientos', 'manage')) throw new Error('FORBIDDEN')
      const product = store.products.find((item) => item.id === movementData.productId)
      const transaction = prepareInventoryMovement({ ...movementData, product, user })
      setStore((current) => ({
        ...current,
        products: current.products.map((item) => (
          item.id === transaction.updatedProduct.id ? transaction.updatedProduct : item
        )),
        movements: [transaction.movement, ...current.movements],
      }))
      return transaction.movement
    },
    confirmPurchase: (purchaseData, user) => {
      if (!hasPermission(currentUser, 'compras', 'manage')) throw new Error('FORBIDDEN')
      const supplier = store.suppliers.find((item) => item.id === purchaseData.supplierId)
      if (!supplier || supplier.estado !== 'ACTIVO') {
        const error = new Error('El proveedor seleccionado no está disponible.')
        error.validationErrors = { supplierId: error.message }
        throw error
      }
      const transaction = preparePurchase({
        products: store.products,
        supplier,
        items: purchaseData.items,
        date: purchaseData.date,
        notes: purchaseData.notes,
        user,
        sequence: store.purchases.length + 1,
      })
      setStore((current) => ({
        ...current,
        products: transaction.products,
        movements: [...transaction.movements, ...current.movements],
        purchases: [transaction.purchase, ...current.purchases],
        purchaseItems: [...transaction.purchaseItems, ...current.purchaseItems],
      }))
      return transaction.purchase
    },
    confirmSale: (saleData, user) => {
      if (!hasPermission(currentUser, 'ventas', 'create')) throw new Error('FORBIDDEN')
      const transaction = prepareSale({
        products: store.products,
        items: saleData.items,
        paymentMethod: saleData.paymentMethod,
        paymentDetails: saleData.paymentDetails,
        customer: saleData.customer,
        discount: saleData.discount,
        observations: saleData.observations,
        user,
        sequence: store.sales.length + 1,
      })
      setStore((current) => ({
        ...current,
        products: transaction.products,
        movements: [...transaction.movements, ...current.movements],
        sales: [transaction.sale, ...current.sales],
        saleItems: [...transaction.saleItems, ...current.saleItems],
        cashEntries: [{
          id: `cash-${transaction.sale.id}`,
          saleId: transaction.sale.id,
          folio: transaction.sale.folio,
          amount: transaction.sale.total,
          paymentMethod: transaction.sale.metodoPago,
          date: transaction.sale.fecha,
          time: transaction.sale.hora,
          userId: user.id,
        }, ...current.cashEntries],
      }))
      return transaction.sale
    },
    holdSale: (draft, user) => {
      if (!hasPermission(currentUser, 'ventas', 'create')) throw new Error('FORBIDDEN')
      const number = Math.max(0, ...store.heldSales.map((item) => Number(item.number) || 0)) + 1
      const held = { id: `held-${Date.now().toString(36)}`, number, folio: `VE-${String(number).padStart(4, '0')}`, status: 'EN_ESPERA', ...draft, userId: user.id, userName: user.nombre, createdAt: new Date().toLocaleString('sv-SE', { hour12: false }).slice(0, 16) }
      setStore((current) => ({ ...current, heldSales: [held, ...current.heldSales] }))
      return held
    },
    resumeHeldSale: (id) => {
      const held = store.heldSales.find((item) => item.id === id)
      if (!held || (currentUser?.rol === 'CAJERA' && held.userId !== currentUser.id)) throw new Error('FORBIDDEN')
      setStore((current) => ({ ...current, heldSales: current.heldSales.filter((item) => item.id !== id) }))
      return held
    },
    cancelHeldSale: (id) => {
      const held = store.heldSales.find((item) => item.id === id)
      if (!held || (currentUser?.rol === 'CAJERA' && held.userId !== currentUser.id)) throw new Error('FORBIDDEN')
      setStore((current) => ({ ...current, heldSales: current.heldSales.filter((item) => item.id !== id) }))
    },
  }), [store, currentUser])

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export function useProducts() {
  const context = useContext(ProductContext)

  if (!context) {
    throw new Error('useProducts debe utilizarse dentro de ProductProvider')
  }

  return context
}
