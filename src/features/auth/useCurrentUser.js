import { useAuth } from './AuthContext'

export function useCurrentUser() {
  return useAuth().currentUser
}
