import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { fetchMe } from './store/slices/authSlice'
import { fetchProducts, fetchCart } from './store/slices/catalogSlice'
import { getToken } from './lib/api'
import App from './App.jsx'
import './index.css'

// Restore session + warm the public catalog once at boot.
// Cart hydrates after /me so the navbar badge is correct on first paint.
store.dispatch(fetchProducts())
if (getToken()) {
  store.dispatch(fetchMe()).then((result) => {
    if (fetchMe.fulfilled.match(result)) {
      // Cart is customer-only on the API
      const role = (result.payload?.role || '').toLowerCase()
      if (role === 'customer') {
        store.dispatch(fetchCart())
      }
    }
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
