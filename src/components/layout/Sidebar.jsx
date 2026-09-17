import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, BellRing, Boxes, ChevronDown, ClipboardCheck, ClipboardList, FileEdit, FilePlus2, ListChecks, LogOut, Menu, Search, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { navigationItems } from '../../app/navigation'
import { useAuth } from '../../features/auth/AuthContext'
import { useCurrentUser } from '../../features/auth/useCurrentUser'
import { BrandLogo } from '../brand/BrandLogo'
import { hasPermission } from '../../utils/permissions'

export function Sidebar({ open, onOpen, onClose, onSearch }) {
  const user = useCurrentUser()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [purchasesOpen, setPurchasesOpen] = useState(pathname.startsWith('/compras'))
  const [inventoryOpen, setInventoryOpen] = useState(pathname.startsWith('/inventario'))
  const items = navigationItems.filter((item) => hasPermission(user, item.module, item.action))

  return (
    <>
      <button
        type="button"
        className="mobile-menu-button"
        aria-label="Abrir navegación"
        aria-expanded={open}
        onClick={onOpen}
      >
        <Menu size={24} />
      </button>
      {open && <button className="sidebar-backdrop" type="button" aria-label="Cerrar navegación" onClick={onClose} />}
      <aside className={`sidebar${open ? ' sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <BrandLogo />
          <button type="button" className="sidebar__close" aria-label="Cerrar navegación" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegación principal">
          <button type="button" className="sidebar__link sidebar__search" onClick={onSearch}>
            <Search size={21} strokeWidth={2.4} />
            <span>Buscar</span>
            <kbd>⌘K</kbd>
          </button>
          {items.map(({ label, path, icon: Icon, section }, index) => path === '/compras' ? (
            <div key={path} className="sidebar__item sidebar__item--group">
              <button type="button" className={`sidebar__link sidebar__group-trigger${pathname.startsWith('/compras') ? ' sidebar__link--active' : ''}`} aria-expanded={purchasesOpen} onClick={() => setPurchasesOpen((current) => !current)}>
                <Icon size={21} strokeWidth={2.4} />
                <span>{label}</span>
                <ChevronDown className={purchasesOpen ? 'sidebar__group-chevron sidebar__group-chevron--open' : 'sidebar__group-chevron'} size={17} />
              </button>
              {purchasesOpen && <div className="sidebar__submenu">
                <NavLink to="/compras" end onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ClipboardList size={17} /><span>Historial de solicitudes</span></NavLink>
                {hasPermission(user, 'compras', 'create') && <NavLink to="/compras/nueva-solicitud" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><FilePlus2 size={17} /><span>Nueva solicitud</span></NavLink>}
                {hasPermission(user, 'compras', 'create') && <NavLink to="/compras/borradores" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><FileEdit size={17} /><span>Borradores</span></NavLink>}
              </div>}
            </div>
          ) : path === '/inventario' ? (
            <div key={path} className="sidebar__item sidebar__item--group">
              <button type="button" className={`sidebar__link sidebar__group-trigger${pathname.startsWith('/inventario') ? ' sidebar__link--active' : ''}`} aria-expanded={inventoryOpen} onClick={() => setInventoryOpen((current) => !current)}>
                <Icon size={21} strokeWidth={2.4} /><span>{label}</span><ChevronDown className={inventoryOpen ? 'sidebar__group-chevron sidebar__group-chevron--open' : 'sidebar__group-chevron'} size={17} />
              </button>
              {inventoryOpen && <div className="sidebar__submenu sidebar__submenu--inventory">
                <NavLink to="/inventario" end onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><Boxes size={17} /><span>Existencias</span></NavLink>
                <NavLink to="/inventario/movimientos" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ArrowLeftRight size={17} /><span>Movimientos</span></NavLink>
                <NavLink to="/inventario/nueva-entrada" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ArrowDownToLine size={17} /><span>Nueva Entrada</span></NavLink>
                <NavLink to="/inventario/nueva-salida" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ArrowUpFromLine size={17} /><span>Nueva Salida</span></NavLink>
                <NavLink to="/inventario/ajustes" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ListChecks size={17} /><span>Ajustes</span></NavLink>
                {hasPermission(user, 'movimientos', 'manage') && <NavLink to="/inventario/conteos" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ClipboardCheck size={17} /><span>Conteos Físicos</span></NavLink>}
                {hasPermission(user, 'movimientos', 'manage') && <NavLink to="/inventario/aprobaciones" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><ClipboardList size={17} /><span>Aprobaciones</span></NavLink>}
                <NavLink to="/inventario/alertas" onClick={onClose} className={({ isActive }) => `sidebar__submenu-link${isActive ? ' sidebar__submenu-link--active' : ''}`}><BellRing size={17} /><span>Alertas de Stock</span></NavLink>
              </div>}
            </div>
          ) : (
            <div key={path} className="sidebar__item">
              {section && items[index - 1]?.section !== section && <span className="sidebar__section">{section}</span>}
            <NavLink
              to={path}
              onClick={onClose}
              className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            >
              <Icon size={21} strokeWidth={2.4} />
              <span>{label}</span>
            </NavLink>
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="user-card">
            <span className="user-card__avatar">{user.iniciales}</span>
            <div className="user-card__identity">
              <strong>{user.nombre}</strong>
              <small>{user.rolLabel}</small>
            </div>
            <span className="user-card__status" title={user.estado} />
          </div>
          <button type="button" className="sidebar__logout" onClick={() => { logout(); onClose(); navigate('/login', { replace: true }) }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
