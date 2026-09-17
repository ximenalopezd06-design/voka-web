import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../auth/useCurrentUser'
import { hasPermission } from '../../utils/permissions'
import { searchItems } from './searchItems'

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('')
  const user = useCurrentUser()
  const navigate = useNavigate()
  const results = useMemo(() => {
    const term = normalize(query.trim())
    return searchItems.filter((item) => hasPermission(user, item.module, item.action) && (!term || normalize(`${item.label} ${item.description} ${item.keywords}`).includes(term)))
  }, [query, user])

  if (!open) return null

  function select(path) {
    navigate(path)
    setQuery('')
    onClose()
  }

  return <div className="global-search-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="global-search" role="dialog" aria-modal="true" aria-label="Buscar en Villa Dulce">
      <div className="global-search__input"><Search size={22} /><input autoFocus value={query} placeholder="Buscar módulos y funciones..." onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onClose(); if (event.key === 'Enter' && results[0]) select(results[0].path) }} /><kbd>⌘ K</kbd><button type="button" aria-label="Cerrar buscador" onClick={onClose}><X size={20} /></button></div>
      <div className="global-search__results">{results.map((item, index) => { const Icon = item.icon; return <button key={item.path} type="button" autoFocus={false} onClick={() => select(item.path)}><span><Icon size={19} /></span><div><strong>{item.label}</strong><small>{item.group} · {item.description}</small></div>{index === 0 && query && <kbd>↵</kbd>}</button> })}{!results.length && <div className="global-search__empty">No encontramos funciones disponibles.</div>}</div>
    </section>
  </div>
}
