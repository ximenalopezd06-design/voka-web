import { Banknote, CreditCard, Send, Split, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'

const methods = [{ id: 'EFECTIVO', label: 'Efectivo', icon: Banknote }, { id: 'TARJETA', label: 'Tarjeta', icon: CreditCard }, { id: 'TRANSFERENCIA', label: 'Transferencia', icon: Send }, { id: 'MIXTO', label: 'Mixto', icon: Split }]
const money = (value) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

export function PaymentModal({ total, onClose, onConfirm }) {
  const [method, setMethod] = useState('EFECTIVO')
  const [details, setDetails] = useState({ cashReceived: '', cash: '', card: '', transfer: '' })
  const [error, setError] = useState('')
  const change = Number(details.cashReceived || 0) - total
  const mixedTotal = Number(details.cash || 0) + Number(details.card || 0) + Number(details.transfer || 0)

  function confirm() {
    if (method === 'EFECTIVO' && Number(details.cashReceived) < total) return setError('El monto recibido debe cubrir el total.')
    if (method === 'MIXTO' && Math.abs(mixedTotal - total) > .009) return setError('La suma de los métodos debe ser igual al total.')
    onConfirm(method, details)
  }

  return <div className="pos-modal-backdrop"><section className="pos-payment-modal" role="dialog" aria-modal="true"><div className="pos-modal__heading"><div><h2>Cobrar venta</h2><p>Total a pagar: <strong>{money(total)}</strong></p></div><button type="button" onClick={onClose}><X /></button></div>
    <div className="pos-payment-methods">{methods.map(({ id, label, icon: Icon }) => <button type="button" className={method === id ? 'active' : ''} key={id} onClick={() => { setMethod(id); setError('') }}><Icon size={21} /><span>{label}</span></button>)}</div>
    {method === 'EFECTIVO' && <div className="pos-payment-fields"><label className="field"><span className="field__label">Monto recibido</span><input autoFocus type="number" min={total} step=".01" value={details.cashReceived} onChange={(event) => setDetails((current) => ({ ...current, cashReceived: event.target.value }))} /></label><div className="pos-change"><span>Cambio</span><strong>{money(Math.max(0, change))}</strong></div></div>}
    {method === 'MIXTO' && <div className="pos-payment-fields pos-payment-fields--mixed">{[['cash', 'Efectivo'], ['card', 'Tarjeta'], ['transfer', 'Transferencia']].map(([key, label]) => <label className="field" key={key}><span className="field__label">{label}</span><input type="number" min="0" step=".01" value={details[key]} onChange={(event) => setDetails((current) => ({ ...current, [key]: event.target.value }))} /></label>)}<div className="pos-change"><span>Asignado</span><strong>{money(mixedTotal)} / {money(total)}</strong></div></div>}
    {error && <p className="login-error">{error}</p>}<div className="pos-modal__actions"><Button className="button--secondary" onClick={onClose}>Cancelar</Button><Button onClick={confirm}>Confirmar cobro</Button></div>
  </section></div>
}
