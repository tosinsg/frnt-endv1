import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from '@/store/slices/authSlice'
import { routeForUser } from '@/lib/authRoutes'
import PageLoader from '@/components/PageLoader'

/**
 * Blocks already-authenticated users from guest pages (login, register, auth entry).
 * Sends them to the correct home for their role / onboarding stage.
 */
export default function RequireGuest({ children }) {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth.token)
  const user = useSelector((s) => s.auth.user)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const authStatus = useSelector((s) => s.auth.status)

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe())
    }
  }, [token, user, dispatch])

  const restoring = Boolean(token && !user && (authStatus === 'loading' || authStatus === 'idle'))
  if (restoring) return <PageLoader />

  if (token && isAuthenticated && user) {
    return <Navigate to={routeForUser(user)} replace />
  }

  return children
}
