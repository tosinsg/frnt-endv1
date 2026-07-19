import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@/lib/api'

export const fetchAdminDashboard = createAsyncThunk(
  'admin/dashboard',
  async (_, { rejectWithValue }) => {
    try {
      return await api.adminDashboard()
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const approveVendor = createAsyncThunk(
  'admin/approveVendor',
  async (vendorId, { rejectWithValue }) => {
    try {
      await api.approveVendor(vendorId)
      return vendorId
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const rejectVendor = createAsyncThunk(
  'admin/rejectVendor',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      await api.rejectVendor(id, reason)
      return { id, reason }
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const confirmTransaction = createAsyncThunk(
  'admin/confirmTransaction',
  async (orderId, { rejectWithValue }) => {
    try {
      return await api.confirmTransaction(orderId)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ orderId, status, notes }, { rejectWithValue }) => {
    try {
      return await api.updateOrderStatus(orderId, status, notes)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const setProductActive = createAsyncThunk(
  'admin/setProductActive',
  async ({ productId, active }, { rejectWithValue }) => {
    try {
      return active
        ? await api.adminActivateProduct(productId)
        : await api.adminDeactivateProduct(productId)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const toggleFeaturedCategory = createAsyncThunk(
  'admin/toggleFeatured',
  async (category, { rejectWithValue }) => {
    try {
      return await api.toggleFeaturedCategory(category)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

const initialState = {
  vendorQueue: [],
  verifiedVendors: [],
  customerQueue: [],
  pendingTransactions: [],
  orders: [],
  products: [],
  activityLog: [],
  stats: {},
  dashboardCuration: {
    featuredCategories: [],
    banners: [],
  },
  status: 'idle',
  error: null,
  actionError: null,
}

function upsertOrder(list, order) {
  if (!order?.id) return list
  const idx = list.findIndex((o) => o.id === order.id)
  if (idx >= 0) {
    const next = [...list]
    next[idx] = order
    return next
  }
  return [order, ...list]
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminActionError(state) {
      state.actionError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        const p = action.payload || {}
        state.vendorQueue = p.vendorQueue || []
        state.verifiedVendors = p.verifiedVendors || []
        state.customerQueue = p.customerQueue || []
        state.pendingTransactions = p.pendingTransactions || []
        state.orders = p.orders || []
        state.products = p.products || []
        state.activityLog = p.activityLog || []
        state.stats = p.stats || {}
        state.dashboardCuration = p.dashboardCuration || {
          featuredCategories: [],
          banners: [],
        }
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load admin dashboard'
      })
      .addCase(approveVendor.fulfilled, (state, action) => {
        state.vendorQueue = state.vendorQueue.filter((x) => x.id !== action.payload)
      })
      .addCase(rejectVendor.fulfilled, (state, action) => {
        state.vendorQueue = state.vendorQueue.filter((x) => x.id !== action.payload.id)
      })
      .addCase(confirmTransaction.fulfilled, (state, action) => {
        const order = action.payload
        state.pendingTransactions = state.pendingTransactions.filter((o) => o.id !== order.id)
        state.orders = upsertOrder(state.orders, order)
        state.actionError = null
      })
      .addCase(confirmTransaction.rejected, (state, action) => {
        state.actionError = action.payload || 'Could not confirm transaction'
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const order = action.payload
        state.orders = upsertOrder(state.orders, order)
        state.pendingTransactions = state.pendingTransactions.filter((o) => o.id !== order.id)
        state.actionError = null
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.actionError = action.payload || 'Could not update order'
      })
      .addCase(setProductActive.fulfilled, (state, action) => {
        const product = action.payload
        const idx = state.products.findIndex((p) => p.id === product.id)
        if (idx >= 0) state.products[idx] = product
      })
      .addCase(toggleFeaturedCategory.fulfilled, (state, action) => {
        state.dashboardCuration.featuredCategories = action.payload.featuredCategories || []
        state.dashboardCuration.banners = action.payload.banners || state.dashboardCuration.banners
      })
  },
})

export const { clearAdminActionError } = adminSlice.actions
export default adminSlice.reducer
