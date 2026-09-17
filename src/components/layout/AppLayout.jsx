import { useEffect, useState } from 'react'
import { ShieldAlert, X } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { GlobalSearch } from '../../features/search/GlobalSearch'

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function openSearch(event) {
      if (event.key === 'Escape') setSearchOpen(false)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', openSearch)
    return () => window.removeEventListener('keydown', openSearch)
  }, [])

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onOpen={() => setMenuOpen(true)} onClose={() => setMenuOpen(false)} onSearch={() => { setSearchOpen(true); setMenuOpen(false) }} />
      <div className="app-main">
        <Header />
        <main className="app-content">
          {location.state?.accessDenied && (
            <div className="access-denied-notice" role="alert">
              <ShieldAlert size={19} />
              <span>No tienes permisos para acceder a esta sección.</span>
              <button type="button" aria-label="Cerrar aviso" onClick={() => navigate(location.pathname, { replace: true, state: null })}><X size={17} /></button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
