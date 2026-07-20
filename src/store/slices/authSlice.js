import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api, setToken, clearToken, getToken } from '@/lib/api'

const PENDING_EMAIL_KEY = 'aro_pending_email'

function readPendingEmail() {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY)
  } catch {
    return null
  }
}

function writePendingEmail(email) {
  try {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email)
    else sessionStorage.removeItem(PENDING_EMAIL_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

function applyAuth(state, payload) {
  if (payload?.token) {
    setToken(payload.token)
    state.token = payload.token
  }
  if (payload?.user) {
    state.user = payload.user
    state.isAuthenticated = true
    state.pendingEmail = null
    writePendingEmail(null)
  }
}

function applyPendingOtp(state, payload) {
  state.pendingEmail = payload.pendingEmail || null
  state.devOtp = payload.devOtp || null
  writePendingEmail(state.pendingEmail)
}

export const registerUser = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    return await api.register(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const loginUser = createAsyncThunk('auth/login', async (body, { rejectWithValue }) => {
  try {
    return await api.login(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (body, { rejectWithValue }) => {
  try {
    return await api.verifyOtp(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      if (!getToken()) throw new Error('No session')
      return await api.me()
    } catch (e) {
      clearToken()
      return rejectWithValue(e.message)
    }
  },
  {
    // Avoid parallel /me storms from main + RequireAuth + RequireGuest
    condition: (_, { getState }) => {
      const { status, user, token } = getState().auth
      if (!token) return false
      if (user) return false
      if (status === 'loading') return false
      return true
    },
  },
)

export const confirmRole = createAsyncThunk('auth/confirmRole', async (role, { rejectWithValue }) => {
  try {
    return await api.confirmRole(role)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

export const completePersonalization = createAsyncThunk(
  'auth/personalization',
  async (body, { rejectWithValue }) => {
    try {
      return await api.personalization(body)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const submitVendorEligibility = createAsyncThunk(
  'auth/vendorEligibility',
  async (body, { rejectWithValue }) => {
    try {
      return await api.vendorEligibility(body)
    } catch (e) {
      return rejectWithValue(e.message)
    }
  },
)

export const updateProfile = createAsyncThunk('auth/updateProfile', async (body, { rejectWithValue }) => {
  try {
    return await api.updateProfile(body)
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

/** Customer → vendor (Sell on Oscillate). Returns new JWT + user. */
export const becomeVendor = createAsyncThunk('auth/becomeVendor', async (_, { rejectWithValue }) => {
  try {
    return await api.becomeVendor()
  } catch (e) {
    return rejectWithValue(e.message)
  }
})

const initialState = {
  user: null,
  token: getToken(),
  isAuthenticated: !!getToken(),
  pendingEmail: readPendingEmail(),
  registrationIntent: null,
  devOtp: null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRegistrationIntent(state, action) {
      state.registrationIntent = action.payload
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.pendingEmail = null
      state.devOtp = null
      state.error = null
      state.status = 'idle'
      clearToken()
      writePendingEmail(null)
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyPendingOtp(state, action.payload)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Registration failed'
      })

      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        if (action.payload.pendingEmail && !action.payload.token) {
          applyPendingOtp(state, action.payload)
        } else {
          applyAuth(state, action.payload)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })

      .addCase(verifyOtp.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyAuth(state, action.payload)
        state.devOtp = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'OTP verification failed'
      })

      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'failed'
        state.user = null
        state.isAuthenticated = false
        state.token = null
      })

      .addCase(confirmRole.fulfilled, (state, action) => {
        applyAuth(state, action.payload)
      })
      .addCase(completePersonalization.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(submitVendorEligibility.fulfilled, (state, action) => {
        // May return AuthResponse { token, user } when customer is promoted to vendor
        if (action.payload?.token && action.payload?.user) {
          applyAuth(state, action.payload)
        } else if (action.payload?.user) {
          state.user = action.payload.user
        } else {
          state.user = action.payload
        }
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })

      .addCase(becomeVendor.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(becomeVendor.fulfilled, (state, action) => {
        state.status = 'succeeded'
        applyAuth(state, action.payload)
      })
      .addCase(becomeVendor.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Could not start vendor onboarding'
      })
  },
})

export const { setRegistrationIntent, logout, clearAuthError } = authSlice.actions
export default authSlice.reducer
