import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import PageLoader from './components/PageLoader'
import RequireAuth from './components/RequireAuth'
import RequireGuest from './components/RequireGuest'

// Every page is code-split. GSAP only loads with the landing page —
// dashboards and forms load fast with none of that weight.
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AuthEntry = lazy(() => import('./pages/AuthEntry'))
const Login = lazy(() => import('./pages/Login'))
const RegistrationForm = lazy(() => import('./pages/RegistrationForm'))
const OTPVerification = lazy(() => import('./pages/OTPVerification'))
const RoleConfirmation = lazy(() => import('./pages/RoleConfirmation'))
const CustomerOnboardingQuiz = lazy(() => import('./pages/CustomerOnboardingQuiz'))
const VendorEligibilityFlow = lazy(() => import('./pages/VendorEligibilityFlow'))
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'))
const VendorDashboard = lazy(() => import('./pages/VendorDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const ProfileCustomization = lazy(() => import('./pages/ProfileCustomization'))
const ProductsBrowse = lazy(() => import('./pages/ProductsBrowse'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CheckoutFlow = lazy(() => import('./pages/CheckoutFlow'))
const CheckoutCallback = lazy(() => import('./pages/CheckoutCallback'))
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'))
const ContactConversation = lazy(() => import('./pages/ContactConversation'))

export default function App() {
  // No route-level AnimatePresence mode="wait" — that forced every navigation
  // to finish an exit animation (or a blank gap) before the next page mounted,
  // and with lazy routes it stacked on top of Suspense → double loading flash.
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 1. Landing — public */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Auth entry + login + register — guests only */}
        <Route
          path="/auth"
          element={
            <RequireGuest>
              <AuthEntry />
            </RequireGuest>
          }
        />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <Login />
            </RequireGuest>
          }
        />
        <Route
          path="/register"
          element={
            <RequireGuest>
              <RegistrationForm />
            </RequireGuest>
          }
        />
        {/* OTP: guest page (no JWT yet). Allow if already logged in only via redirect. */}
        <Route
          path="/verify-otp"
          element={
            <RequireGuest>
              <OTPVerification />
            </RequireGuest>
          }
        />

        {/* 5. Role confirmation — authenticated, no role yet */}
        <Route
          path="/role-confirmation"
          element={
            <RequireAuth allowIncompleteOnboarding>
              <RoleConfirmation />
            </RequireAuth>
          }
        />

        {/* 6–7. Onboarding — role-scoped, incomplete stage allowed */}
        <Route
          path="/onboarding/quiz"
          element={
            <RequireAuth roles={['customer']} allowIncompleteOnboarding>
              <CustomerOnboardingQuiz />
            </RequireAuth>
          }
        />
        <Route
          path="/onboarding/vendor"
          element={
            <RequireAuth roles={['vendor']} allowIncompleteOnboarding>
              <VendorEligibilityFlow />
            </RequireAuth>
          }
        />

        {/* 8–10. Dashboards — role + completed onboarding enforced */}
        <Route
          path="/customer/dashboard"
          element={
            <RequireAuth roles={['customer']}>
              <CustomerDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/vendor/dashboard"
          element={
            <RequireAuth roles={['vendor']}>
              <VendorDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminDashboard />
            </RequireAuth>
          }
        />

        {/* 11. Profile — any authenticated role after onboarding is complete */}
        <Route
          path="/profile"
          element={
            <RequireAuth roles={['customer', 'vendor', 'admin']}>
              <ProfileCustomization />
            </RequireAuth>
          }
        />

        {/* Public browsing + product detail */}
        <Route path="/products" element={<ProductsBrowse />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* 13. Checkout — authenticated customers (shoppers) */}
        <Route
          path="/checkout"
          element={
            <RequireAuth roles={['customer']}>
              <CheckoutFlow />
            </RequireAuth>
          }
        />
        <Route
          path="/checkout/callback"
          element={
            <RequireAuth roles={['customer']}>
              <CheckoutCallback />
            </RequireAuth>
          }
        />

        {/* 14. Terms */}
        <Route path="/terms" element={<TermsAndConditions />} />

        {/* 15. Contact / start a conversation — members only */}
        <Route
          path="/contact"
          element={
            <RequireAuth allowIncompleteOnboarding>
              <ContactConversation />
            </RequireAuth>
          }
        />
      </Routes>
    </Suspense>
  )
}
