const API_BASE = import.meta.env.VITE_API_URL || '/api'

const TOKEN_KEY = 'aro_token'

/** Default request timeout — hanging fetches made the UI feel frozen. */
const DEFAULT_TIMEOUT_MS = 15_000

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal: externalSignal, headers: extraHeaders, ...fetchOpts } =
    options

  const headers = {
    ...(fetchOpts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(extraHeaders || {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const controller = new AbortController()
  const onExternalAbort = () => controller.abort()
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort()
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true })
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...fetchOpts,
      headers,
      signal: controller.signal,
    })

    let data = null
    const text = await res.text()
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }

    if (!res.ok) {
      const message = data?.message || res.statusText || 'Request failed'
      const err = new Error(message)
      err.status = res.status
      err.data = data
      throw err
    }

    return data
  } catch (e) {
    if (e?.name === 'AbortError') {
      const err = new Error('Request timed out — is the backend running?')
      err.status = 0
      err.aborted = true
      throw err
    }
    throw e
  } finally {
    clearTimeout(timer)
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort)
  }
}

async function uploadFile(path, file) {
  const form = new FormData()
  form.append('file', file)
  const token = getToken()
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60_000)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: form,
      signal: controller.signal,
    })
    const text = await res.text()
    let data = null
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }
    if (!res.ok) {
      throw new Error(data?.message || res.statusText || 'Upload failed')
    }
    return data
  } catch (e) {
    if (e?.name === 'AbortError') throw new Error('Upload timed out')
    throw e
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (email) => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  me: () => request('/auth/me'),

  // User onboarding / profile
  confirmRole: (role) => request('/users/role', { method: 'POST', body: JSON.stringify({ role }) }),
  personalization: (body) =>
    request('/users/personalization', { method: 'POST', body: JSON.stringify(body) }),
  vendorEligibility: (body) =>
    request('/users/vendor-eligibility', { method: 'POST', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  becomeVendor: () => request('/users/become-vendor', { method: 'POST' }),

  // Catalog
  getProducts: (category) =>
    request(category ? `/products?category=${encodeURIComponent(category)}` : '/products'),
  getProduct: (id) => request(`/products/${id}`),
  getMyProducts: () => request('/products/mine'),
  createProduct: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
  deactivateProduct: (id) => request(`/products/${id}/deactivate`, { method: 'POST' }),
  getProductsByVendor: (vendorId) => request(`/products/vendor/${vendorId}`),

  // Cart (customers only)
  getCart: () => request('/cart'),
  addToCart: (productId, quantity = 1) =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  setCartQuantity: (productId, quantity) =>
    request(`/cart/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),
  removeFromCart: (productId) => request(`/cart/items/${productId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  // Orders / payments (customers)
  getOrders: () => request('/orders'),
  checkout: (body) => request('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
  initiateCheckout: (body) =>
    request('/orders/checkout/init', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (reference) =>
    request('/orders/verify-payment', { method: 'POST', body: JSON.stringify({ reference }) }),
  paymentConfig: () => request('/orders/payment-config'),

  // Uploads (Cloudinary)
  uploadVendorDoc: (file) => uploadFile('/uploads/vendor-doc', file),
  uploadProductImage: (file) => uploadFile('/uploads/product-image', file),
  uploadPaymentReceipt: (file) => uploadFile('/uploads/payment-receipt', file),
  uploadStatus: () => request('/uploads/status'),

  // Reviews
  getProductReviews: (productId) => request(`/reviews/products/${productId}`),
  getVendorReviews: (vendorId) => request(`/reviews/vendors/${vendorId}`),
  addProductReview: (productId, body) =>
    request(`/reviews/products/${productId}`, { method: 'POST', body: JSON.stringify(body) }),
  addVendorReview: (vendorId, body) =>
    request(`/reviews/vendors/${vendorId}`, { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  adminDashboard: () => request('/admin/dashboard'),
  approveVendor: (vendorId) => request(`/admin/vendors/${vendorId}/approve`, { method: 'POST' }),
  rejectVendor: (vendorId, reason) =>
    request(`/admin/vendors/${vendorId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
  confirmTransaction: (orderId) =>
    request(`/admin/orders/${orderId}/confirm`, { method: 'POST' }),
  updateOrderStatus: (orderId, status, notes) =>
    request(`/admin/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, notes }),
    }),
  adminListOrders: () => request('/admin/orders'),
  adminListProducts: () => request('/admin/products'),
  adminActivateProduct: (productId) =>
    request(`/admin/products/${productId}/activate`, { method: 'POST' }),
  adminDeactivateProduct: (productId) =>
    request(`/admin/products/${productId}/deactivate`, { method: 'POST' }),
  toggleFeaturedCategory: (category) =>
    request(`/admin/featured-categories/${encodeURIComponent(category)}/toggle`, {
      method: 'POST',
    }),

  health: () => request('/health', { timeoutMs: 5_000 }),
}
