export const EMPLOYEE_ROLES = ['ADMINISTRADOR', 'CAJERA']
export const EMPLOYEE_STATUSES = ['ACTIVO', 'INACTIVO']
export const MIN_PASSWORD_LENGTH = 8

export function validateEmployeeProfile(data, employees, currentId = null) {
  const errors = {}
  if (!data.nombre?.trim()) errors.nombre = 'El nombre es obligatorio.'
  if (!data.apellido?.trim()) errors.apellido = 'Los apellidos son obligatorios.'
  if (!data.username?.trim()) errors.username = 'El nombre de usuario es obligatorio.'
  else if (employees.some((item) => item.id !== currentId && item.username.toLowerCase() === data.username.trim().toLowerCase())) {
    errors.username = 'El nombre de usuario ya está registrado.'
  }
  if (!EMPLOYEE_ROLES.includes(data.rol)) errors.rol = 'Selecciona un rol válido.'
  if (!EMPLOYEE_STATUSES.includes(data.estado)) errors.estado = 'Selecciona un estado válido.'
  return errors
}

export function validateNewPassword(password, confirmation) {
  if (!password) return 'Ingresa la nueva contraseña.'
  if (password.length < MIN_PASSWORD_LENGTH) return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`
  if (password !== confirmation) return 'Las contraseñas no coinciden.'
  return ''
}
