import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from '@/store/slices/authSlice'
import { redirectForAccess, routeForUser } from '@/lib/authRoutes'
import PageLoader from '@/components/PageLoader'

/**
 * Gate routes by auth + optional role(s) + onboarding stage.
 *
 * @param {{
 *   children: import('react').ReactNode,
 *   roles?: string[],
 *   allowIncompleteOnboarding?: boolean
 * }} props
 *   roles — if set, user.role must be one of these (case-insensitive)
 *   allowIncompleteOnboarding — skip forcing quiz / vendor eligibility
 *     (use on onboarding screens themselves and role confirmation)
 */
export default function RequireAuth({ children, roles, allowIncompleteOnboarding = false }) {
  const dispatch = useDispatch()
  const location = useLocation()
  const token = useSelector((s) => s.auth.token)
  const user = useSelector((s) => s.auth.user)
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const authStatus = useSelector((s) => s.auth.status)

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe())
    }
  }, [token, user, dispatch])

  // Session restore in progress — never redirect until we know the outcome
  const restoring = Boolean(token && !user && (authStatus === 'loading' || authStatus === 'idle'))
  if (restoring) return <PageLoader />

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Token was present but /me failed (expired / invalid)
  if (token && !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user) {
    const dest = redirectForAccess(
      user,
      { roles, allowIncompleteOnboarding },
      location.pathname,
    )
    if (dest && dest !== location.pathname) {
      return <Navigate to={dest} replace />
    }

    if (roles?.length) {
      const role = (user.role || '').toLowerCase()
      const allowed = roles.map((r) => r.toLowerCase())
      if (!allowed.includes(role)) {
        return <Navigate to={routeForUser(user)} replace />
      }
    }
  }

  return children
}
