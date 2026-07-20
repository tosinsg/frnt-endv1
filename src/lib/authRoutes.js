/**
 * Home path for a user based on role / onboarding stage.
 * Used after login/OTP and when a role guard rejects access.
 *
 * Matrix:
 *   no role / role_selection  → /role-confirmation
 *   admin                     → /admin
 *   customer + personalizing  → /onboarding/quiz
 *   customer + active         → /customer/dashboard
 *   vendor + not submitted    → /onboarding/vendor
 *   vendor + pending/verified → /vendor/dashboard
 */
export function routeForUser(user) {
  if (!user) return '/login'

  const role = (user.role || '').toLowerCase()
  const stage = (user.onboardingStage || '').toLowerCase()

  if (!role || stage === 'role_selection' || stage === 'kyc_pending') {
    return '/role-confirmation'
  }

  if (role === 'admin') return '/admin'

  if (role === 'vendor') {
    // Must finish eligibility form first (unverified / no status).
    // After submit status becomes "pending" — dashboard is allowed (restricted UI).
    if (
      stage === 'personalizing' ||
      !user.vendorVerificationStatus ||
      user.vendorVerificationStatus === 'unverified'
    ) {
      return '/onboarding/vendor'
    }
    return '/vendor/dashboard'
  }

  if (role === 'customer') {
    if (stage === 'personalizing') return '/onboarding/quiz'
    return '/customer/dashboard'
  }

  return '/role-confirmation'
}

/** True when user still needs to pick customer vs vendor. */
export function needsRoleSelection(user) {
  if (!user) return false
  const role = (user.role || '').toLowerCase()
  const stage = (user.onboardingStage || '').toLowerCase()
  return !role || stage === 'role_selection' || stage === 'kyc_pending'
}

/** True when customer should finish personalization quiz first. */
export function needsCustomerOnboarding(user) {
  if (!user) return false
  return (
    (user.role || '').toLowerCase() === 'customer' &&
    (user.onboardingStage || '').toLowerCase() === 'personalizing'
  )
}

/** True when vendor should complete eligibility / doc upload first. */
export function needsVendorOnboarding(user) {
  if (!user) return false
  if ((user.role || '').toLowerCase() !== 'vendor') return false
  const stage = (user.onboardingStage || '').toLowerCase()
  const status = (user.vendorVerificationStatus || '').toLowerCase()
  return stage === 'personalizing' || !status || status === 'unverified'
}

/**
 * Role requirements for known protected paths (used after login returnTo).
 * Paths not listed here are treated as open to any authenticated user
 * (subject to onboarding rules unless allowIncomplete is implied).
 */
const PATH_ROLE_RULES = [
  { prefix: '/customer/dashboard', roles: ['customer'] },
  { prefix: '/vendor/dashboard', roles: ['vendor'] },
  { prefix: '/admin', roles: ['admin'] },
  { prefix: '/checkout', roles: ['customer'] },
  { prefix: '/onboarding/quiz', roles: ['customer'], allowIncompleteOnboarding: true },
  // Customers may open eligibility before becoming vendors; role flips on submit
  { prefix: '/onboarding/vendor', roles: ['customer', 'vendor'], allowIncompleteOnboarding: true },
  { prefix: '/role-confirmation', allowIncompleteOnboarding: true },
  { prefix: '/profile', roles: ['customer', 'vendor', 'admin'] },
  { prefix: '/contact', allowIncompleteOnboarding: true },
]

/**
 * If the user is on a page they shouldn't access yet (or wrong role),
 * return the path they should be sent to. Otherwise null.
 *
 * @param {object|null} user
 * @param {{ roles?: string[], allowIncompleteOnboarding?: boolean, guestOnly?: boolean }} opts
 * @param {string} [pathname]
 */
export function redirectForAccess(user, opts = {}, pathname = '') {
  const { roles, allowIncompleteOnboarding = false } = opts

  if (!user) return '/login'

  // Role-gated routes
  if (roles?.length) {
    const role = (user.role || '').toLowerCase()
    const allowed = roles.map((r) => r.toLowerCase())
    if (!allowed.includes(role)) {
      return routeForUser(user)
    }
  }

  // Role confirmation is only for users without a role
  if (pathname === '/role-confirmation' && !needsRoleSelection(user)) {
    return routeForUser(user)
  }

  // Force unfinished onboarding before dashboards / checkout / profile
  if (!allowIncompleteOnboarding) {
    if (needsRoleSelection(user) && pathname !== '/role-confirmation') {
      return '/role-confirmation'
    }
    if (needsCustomerOnboarding(user) && !pathname.startsWith('/onboarding/quiz')) {
      return '/onboarding/quiz'
    }
    if (needsVendorOnboarding(user) && !pathname.startsWith('/onboarding/vendor')) {
      return '/onboarding/vendor'
    }
  }

  return null
}

/**
 * Safe post-login destination: prefers the page the user tried to open,
 * but only if their role / onboarding stage allows it.
 */
export function resolvePostAuthPath(user, intendedPath) {
  const home = routeForUser(user)
  if (!user) return '/login'
  if (typeof intendedPath !== 'string' || !intendedPath.startsWith('/') || intendedPath.startsWith('//')) {
    return home
  }

  // Never send people back to guest-only auth screens after login
  if (
    intendedPath === '/login' ||
    intendedPath === '/register' ||
    intendedPath === '/auth' ||
    intendedPath === '/verify-otp'
  ) {
    return home
  }

  const rule = PATH_ROLE_RULES.find((r) => intendedPath === r.prefix || intendedPath.startsWith(`${r.prefix}/`))
  const opts = rule
    ? { roles: rule.roles, allowIncompleteOnboarding: Boolean(rule.allowIncompleteOnboarding) }
    : {}

  const blocked = redirectForAccess(user, opts, intendedPath)
  return blocked || intendedPath
}
