import { Check, ChevronDown, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function ProfileSelect({ profiles, value, onChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const selectedProfile = profiles.find((profile) => profile.id === value)

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function selectProfile(profile) {
    onChange(profile.id)
    setOpen(false)
  }

  return (
    <div className="login-profile-select" ref={containerRef}>
      <span className="field__label" id="loginProfileLabel">Perfil</span>
      <button
        type="button"
        className={`login-profile-select__trigger${open ? ' login-profile-select__trigger--open' : ''}`}
        aria-labelledby="loginProfileLabel"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <UserRound size={19} />
        <span className={selectedProfile ? '' : 'login-profile-select__placeholder'}>
          {selectedProfile?.nombre ?? 'Seleccionar perfil'}
        </span>
        <ChevronDown className="login-profile-select__chevron" size={19} />
      </button>

      {open && (
        <div className="login-profile-select__menu" role="listbox" aria-labelledby="loginProfileLabel">
          {profiles.map((profile) => (
            <button
              type="button"
              role="option"
              aria-selected={profile.id === value}
              className="login-profile-select__option"
              key={profile.id}
              onClick={() => selectProfile(profile)}
            >
              <span><strong>{profile.nombre}</strong><small>{profile.rolLabel}</small></span>
              {profile.id === value && <Check size={18} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
