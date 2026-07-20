import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

/** Skip re-fetching the full catalog if it was loaded this recently (ms). */
const PRODUCTS_STALE_MS = 60_000

export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (options = {}, { getState, rejectWithValue }) => {
    try {
      const force = typeof options === 'object' && options?.force
      // Always load the full catalog. Category filtering is client-side so we
      // never overwrite the store with a partial list (that caused empty feeds
      // after browsing ?category=…).
      const { products, productsFetchedAt, status } = getState().catalog
      if (
        !force &&
        products.length > 0 &&
        productsFetchedAt &&
        Date.now() - productsFetchedAt < PRODUCTS_STALE_MS &&
        status !== 'failed'
      ) {
        return { products, fromCache: true }
      }
      const list = await api.getProducts()
      return { products: list || [], fromCache: false }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchProduct = createAsyncThunk('catalog/fetchProduct', async (id, { rejectWithValue }) => {
  try {
    return await api.getProduct(id)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchCart = createAsyncThunk('catalog/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await api.getCart()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const addToCart = createAsyncThunk(
  'catalog/addToCart',
  async (arg, { rejectWithValue }) => {
    try {
      // Supports addToCart(productId) or addToCart({ productId, quantity })
      const productId = typeof arg === 'object' ? arg.productId : arg
      const quantity = typeof arg === 'object' ? Number(arg.quantity) || 1 : 1
      return await api.addToCart(productId, quantity)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const removeFromCart = createAsyncThunk(
  'catalog/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      return await api.removeFromCart(productId)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const setCartQuantity = createAsyncThunk(
  'catalog/setCartQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      if (quantity <= 0) return await api.removeFromCart(productId)
      return await api.setCartQuantity(productId, quantity)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const clearCart = createAsyncThunk('catalog/clearCart', async (_, { rejectWithValue }) => {
  try {
    return await api.clearCart()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchOrders = createAsyncThunk('catalog/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    return await api.getOrders()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const checkout = createAsyncThunk('catalog/checkout', async (body, { rejectWithValue }) => {
  try {
    return await api.checkout(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const initiateCheckout = createAsyncThunk(
  'catalog/initiateCheckout',
  async (body, { rejectWithValue }) => {
    try {
      return await api.initiateCheckout(body)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const verifyPayment = createAsyncThunk(
  'catalog/verifyPayment',
  async (reference, { rejectWithValue }) => {
    try {
      return await api.verifyPayment(reference)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchProductReviews = createAsyncThunk(
  'catalog/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      return { productId, reviews: await api.getProductReviews(productId) }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const fetchVendorReviews = createAsyncThunk(
  'catalog/fetchVendorReviews',
  async (vendorId, { rejectWithValue }) => {
    try {
      return { vendorId, reviews: await api.getVendorReviews(vendorId) }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const addProductReview = createAsyncThunk(
  'catalog/addProductReview',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      return await api.addProductReview(productId, { rating, comment })
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const addVendorReview = createAsyncThunk(
  'catalog/addVendorReview',
  async ({ vendorId, rating, comment, orderId }, { rejectWithValue }) => {
    try {
      return await api.addVendorReview(vendorId, { rating, comment, orderId })
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

function bumpCartItem(cart, productId, delta) {
  const next = cart.map((c) => ({ ...c }))
  const existing = next.find((c) => c.productId === productId)
  if (existing) {
    existing.quantity = Math.max(0, existing.quantity + delta)
    if (existing.quantity === 0) {
      return next.filter((c) => c.productId !== productId)
    }
    return next
  }
  if (delta > 0) next.push({ productId, quantity: delta })
  return next
}

const initialState = {
  products: [],
  productsFetchedAt: null,
  currentProduct: null,
  cart: [],
  productReviews: [],
  vendorReviews: [],
  orders: [],
  status: 'idle',
  cartStatus: 'idle',
  error: null,
}

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    // Optimistic local add when not logged in — UI can still preview
    addToCartLocal(state, action) {
      state.cart = bumpCartItem(state.cart, action.payload, 1)
    },
    resetCatalogSession(state) {
      state.cart = []
      state.orders = []
      state.cartStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        // Keep showing existing products while refreshing — no full-page flash
        if (state.products.length === 0) state.status = 'loading'
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (!action.payload?.fromCache) {
          state.products = action.payload?.products || []
          state.productsFetchedAt = Date.now()
        }
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load products'
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload
        if (!action.payload?.id) return
        const idx = state.products.findIndex((p) => p.id === action.payload.id)
        if (idx >= 0) state.products[idx] = action.payload
        else state.products.push(action.payload)
      })
      .addCase(fetchCart.pending, (state) => {
        state.cartStatus = 'loading'
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cartStatus = 'succeeded'
        state.cart = action.payload || []
      })
      .addCase(fetchCart.rejected, (state) => {
        state.cartStatus = 'failed'
      })
      // Optimistic cart: badge updates immediately, then reconciles with server
      .addCase(addToCart.pending, (state, action) => {
        const arg = action.meta.arg
        const productId = typeof arg === 'object' ? arg.productId : arg
        const quantity = typeof arg === 'object' ? Number(arg.quantity) || 1 : 1
        state.cart = bumpCartItem(state.cart, productId, quantity)
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(addToCart.rejected, (state, action) => {
        const arg = action.meta.arg
        const productId = typeof arg === 'object' ? arg.productId : arg
        const quantity = typeof arg === 'object' ? Number(arg.quantity) || 1 : 1
        state.cart = bumpCartItem(state.cart, productId, -quantity)
      })
      .addCase(removeFromCart.pending, (state, action) => {
        state.cart = state.cart.filter((c) => c.productId !== action.meta.arg)
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(setCartQuantity.pending, (state, action) => {
        const { productId, quantity } = action.meta.arg
        if (quantity <= 0) {
          state.cart = state.cart.filter((c) => c.productId !== productId)
        } else {
          const existing = state.cart.find((c) => c.productId === productId)
          if (existing) existing.quantity = quantity
          else state.cart.push({ productId, quantity })
        }
      })
      .addCase(setCartQuantity.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(setCartQuantity.rejected, (state) => {
        // Server is source of truth — next fetchCart will reconcile
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload || []
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload || []
      })
      .addCase(checkout.fulfilled, (state, action) => {
        state.cart = []
        if (action.payload) {
          state.orders = [action.payload, ...state.orders]
        }
      })
      .addCase(initiateCheckout.fulfilled, (state, action) => {
        // Remove only checked-out lines (partial checkout supported)
        const ids = action.meta?.arg?.productIds
        if (Array.isArray(ids) && ids.length > 0) {
          const remove = new Set(ids)
          state.cart = state.cart.filter((c) => !remove.has(c.productId))
        } else {
          state.cart = []
        }
        const order = action.payload?.order
        if (order) {
          state.orders = [order, ...state.orders.filter((o) => o.id !== order.id)]
        }
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        const order = action.payload
        if (!order) return
        const idx = state.orders.findIndex((o) => o.id === order.id)
        if (idx >= 0) state.orders[idx] = order
        else state.orders = [order, ...state.orders]
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        const { productId, reviews } = action.payload
        state.productReviews = [
          ...state.productReviews.filter((r) => r.productId !== productId),
          ...reviews,
        ]
      })
      .addCase(fetchVendorReviews.fulfilled, (state, action) => {
        const { vendorId, reviews } = action.payload
        state.vendorReviews = [
          ...state.vendorReviews.filter((r) => r.vendorId !== vendorId),
          ...reviews,
        ]
      })
      .addCase(addProductReview.fulfilled, (state, action) => {
        state.productReviews = [action.payload, ...state.productReviews]
      })
      .addCase(addVendorReview.fulfilled, (state, action) => {
        state.vendorReviews = [action.payload, ...state.vendorReviews]
      })
  },
})

export const { addToCartLocal, resetCatalogSession } = catalogSlice.actions
export default catalogSlice.reducer
