import { Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

export function CancelHeldSaleModal({ sale, onClose, onConfirm }) {
  if (!sale) return null
  return <div className="pos-modal-backdrop"><section className="cancel-held-sale-modal" role="alertdialog" aria-modal="true" aria-label="Cancelar venta en espera">
    <span><Trash2 size={25} /></span><h2>¿Deseas cancelar esta venta en espera?</h2><p>{sale.folio} se eliminará de la lista. Esta acción no afecta el inventario ni los ingresos.</p>
    <div className="pos-modal__actions"><Button className="button--secondary" onClick={onClose}>Cancelar</Button><Button className="button--danger" onClick={() => onConfirm(sale.id)}>Eliminar venta</Button></div>
  </section></div>
}
