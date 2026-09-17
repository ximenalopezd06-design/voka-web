// Credenciales de desarrollo separadas de los perfiles que se muestran en la interfaz.
// En producción, la verificación se realizará exclusivamente en el backend.
export const mockCredentials = {
  'user-admin-001': {
    salt: 'vd-admin-2026',
    passwordHash: 'bc2b472dcefe6ccd3b1b6b99a897dbc734b85ed5d1bb406118cd19c56fc95434',
  },
  'user-cashier-001': {
    salt: 'vd-cashier-2026',
    passwordHash: 'd793f6682602e6b95e5c7123c54fb313053de09009605795311e975e30d0fdcd',
  },
}
