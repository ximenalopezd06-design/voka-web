import { hasPermission } from '../../utils/permissions'
import { useCurrentUser } from './useCurrentUser'

export function usePermission(module, action = 'view') {
  return hasPermission(useCurrentUser(), module, action)
}
