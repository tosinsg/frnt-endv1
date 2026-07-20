import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Check, X, Activity, LayoutGrid, Package, CreditCard, ExternalLink } from 'lucide-react'
import Navbar from '@/components/Navbar'
import {
  approveVendor,
  rejectVendor,
  toggleFeaturedCategory,
  fetchAdminDashboard,
  confirmTransaction,
  updateOrderStatus,
  setProductActive,
} from '@/store/slices/adminSlice'
import { cn } from '@/lib/utils'
import { orderStatusMeta } from '@/lib/orderStatus'

const sections = [
  'Transactions',
  'Vendor Queue',
  'Vendor products',
  'All orders',
  'Activity Log',
  'Dashboard Curation',
]

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const {
    vendorQueue,
    pendingTransactions,
    orders,
    products,
    activityLog,
    dashboardCuration,
    stats,
    status,
    error,
    actionError,
  } = useSelector((s) => s.admin)
  const [section, setSection] = useState(sections[0])
  const [rejectingId, setRejectingId] = useState(null)
  const [reason, setReason] = useState('')
  const [filterVendorId, setFilterVendorId] = useState('')

  const allCategories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Books', 'Sports']

  useEffect(() => {
    dispatch(fetchAdminDashboard())
  }, [dispatch])

  function submitReject(id) {
    dispatch(rejectVendor({ id, reason: reason || 'Did not meet eligibility criteria.' }))
    setRejectingId(null)
    setReason('')
  }

  const filteredProducts = filterVendorId
    ? products.filter((p) => p.vendorId === filterVendorId)
    : products

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-10 grid md:grid-cols-[220px_1fr] gap-10">
        <aside className="flex md:flex-col gap-1 overflow-x-auto">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={cn(
                'text-left px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                section === s ? 'bg-ink text-white' : 'text-onLight/60 hover:bg-onLight/5',
              )}
            >
              {s}
              {s === 'Transactions' && pendingTransactions.length > 0 && (
                <span className="ml-2 text-[10px] bg-amber text-white rounded-full px-1.5 py-0.5">
                  {pendingTransactions.length}
                </span>
              )}
              {s === 'Vendor Queue' && vendorQueue.length > 0 && (
                <span className="ml-2 text-[10px] bg-leaf text-white rounded-full px-1.5 py-0.5">
                  {vendorQueue.length}
                </span>
              )}
            </button>
          ))}
        </aside>

        <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {status === 'loading' && (
            <p className="text-sm text-onLight/45 mb-4">Loading admin data…</p>
          )}
          {error && <p className="text-sm text-coral mb-4">{error}</p>}
          {actionError && <p className="text-sm text-coral mb-4">{actionError}</p>}

          {/* Stats strip */}
          {stats && Object.keys(stats).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                ['Pending txs', stats.pendingTransactions],
                ['Pending vendors', stats.pendingVendors],
                ['Orders', stats.totalOrders],
                ['Products', stats.totalProducts],
              ].map(([label, value]) => (
                <div key={label} className="bg-white border border-onLight/10 rounded-xl px-4 py-3">
                  <div className="text-xs text-onLight/45">{label}</div>
                  <div className="text-xl font-semibold mt-0.5">{value ?? 0}</div>
                </div>
              ))}
            </div>
          )}

          {section === 'Transactions' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-onLight/50 flex items-center gap-1.5 mb-1">
                <CreditCard size={15} /> Orders with payment receipts awaiting your review. Open the
                receipt, verify the transfer, then confirm — the order is{' '}
                <strong className="font-medium text-onLight/70">not complete</strong> until you confirm.
              </p>
              {pendingTransactions.length === 0 && (
                <p className="text-sm text-onLight/45">No transactions awaiting confirmation.</p>
              )}
              {pendingTransactions.map((o) => (
                <div key={o.id} className="bg-white border border-onLight/10 rounded-2xl p-5">
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium">
                        ₦{(o.total || 0).toLocaleString()} · {o.customerName || o.customerEmail || 'Customer'}
                      </h3>
                      <p className="text-xs text-onLight/45 mt-1">
                        {o.customerEmail} · Ref: {o.paymentReference || '—'} ·{' '}
                        {o.paymentProvider || 'receipt'}
                      </p>
                      <p className="text-xs text-onLight/40 mt-1">
                        {(o.items || [])
                          .map((i) => `${i.productName} ×${i.quantity}`)
                          .join(', ') || 'No line items'}
                      </p>
                      {o.deliveryAddress && (
                        <p className="text-xs text-onLight/40 mt-1">
                          Ship to: {o.deliveryAddress.fullName}, {o.deliveryAddress.address} ·{' '}
                          {o.deliveryAddress.phone}
                        </p>
                      )}
                      <p className="text-xs text-onLight/35 mt-1">
                        {o.placedAt ? new Date(o.placedAt).toLocaleString() : ''}
                      </p>
                      {o.paymentReceiptUrl && (
                        <div className="mt-3">
                          <a
                            href={o.paymentReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-leaf-dim bg-leaf/10 hover:bg-leaf/15 rounded-full px-3 py-1.5"
                          >
                            View payment receipt
                          </a>
                          {/\.(png|jpe?g|gif|webp)(\?|$)/i.test(o.paymentReceiptUrl) && (
                            <a
                              href={o.paymentReceiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 block max-w-xs rounded-xl overflow-hidden border border-onLight/10"
                            >
                              <img
                                src={o.paymentReceiptUrl}
                                alt="Payment receipt"
                                className="w-full h-auto max-h-40 object-cover"
                              />
                            </a>
                          )}
                        </div>
                      )}
                      {!o.paymentReceiptUrl && (
                        <p className="text-xs text-coral mt-2">No receipt attached</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={cn('text-xs font-medium rounded-full px-3 py-1.5', orderStatusMeta(o.status).className)}>
                        {orderStatusMeta(o.status).label}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => dispatch(confirmTransaction(o.id))}
                          className="flex items-center gap-1.5 text-xs font-medium bg-emerald/15 text-emerald rounded-full px-3 py-2"
                        >
                          <Check size={14} /> Confirm payment
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(updateOrderStatus({ orderId: o.id, status: 'Cancelled' }))
                          }
                          className="flex items-center gap-1.5 text-xs font-medium bg-coral/15 text-coral rounded-full px-3 py-2"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === 'Vendor Queue' && (
            <div className="flex flex-col gap-4">
              {vendorQueue.filter((v) => v.status === 'pending').length === 0 && (
                <p className="text-sm text-onLight/45">No pending vendor applications.</p>
              )}
              {vendorQueue
                .filter((v) => v.status === 'pending')
                .map((v) => (
                  <div key={v.id} className="bg-white border border-onLight/10 rounded-2xl p-5">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <h3 className="font-medium">{v.businessName || v.name}</h3>
                        <p className="text-xs text-onLight/45 mt-1">
                          {v.businessCategory} · {v.expectedProductRange}
                        </p>
                        <p className="text-xs text-onLight/35 mt-1">{v.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(v.documentUrls || []).length === 0 && (
                            <span className="text-xs text-coral">No documents uploaded</span>
                          )}
                          {(v.documentUrls || []).map((url) => (
                            <a
                              key={url}
                              href={url.startsWith('http') ? url : undefined}
                              target="_blank"
                              rel="noreferrer"
                              className={cn(
                                'inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1',
                                url.startsWith('http')
                                  ? 'bg-leaf/10 text-leaf-dim hover:bg-leaf/15'
                                  : 'bg-amber/10 text-amber',
                              )}
                              title={url}
                            >
                              <ExternalLink size={12} />
                              {url.startsWith('http') ? 'View document' : 'Invalid / local URL'}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => dispatch(approveVendor(v.id))}
                          className="flex items-center gap-1.5 text-xs font-medium bg-emerald/15 text-emerald rounded-full px-3 py-2"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(v.id)}
                          className="flex items-center gap-1.5 text-xs font-medium bg-coral/15 text-coral rounded-full px-3 py-2"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </div>
                    {rejectingId === v.id && (
                      <div className="mt-4 flex gap-2">
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Reason (shown to the vendor)"
                          className="flex-1 h-10 px-3 rounded-lg border border-onLight/15 text-sm outline-none focus:border-coral"
                        />
                        <button
                          onClick={() => submitReject(v.id)}
                          className="text-xs font-medium bg-coral text-white rounded-lg px-4"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {section === 'Vendor products' && (
            <div>
              <p className="text-sm text-onLight/50 flex items-center gap-1.5 mb-4">
                <Package size={15} /> All listings from vendors. Deactivate anything that violates
                policy.
              </p>
              <div className="mb-4">
                <input
                  value={filterVendorId}
                  onChange={(e) => setFilterVendorId(e.target.value)}
                  placeholder="Filter by vendor id (optional)"
                  className="h-10 px-3 rounded-lg border border-onLight/15 text-sm w-full max-w-md outline-none focus:border-leaf"
                />
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-sm text-onLight/45">
                  No products yet. Verified vendors add real listings from their dashboard.
                </p>
              )}
              <div className="flex flex-col gap-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border border-onLight/10 rounded-xl p-4 flex justify-between items-center gap-4 flex-wrap"
                  >
                    <div>
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-onLight/45 mt-0.5">
                        {p.vendor} · {p.category} · ₦{(p.price || 0).toLocaleString()} · vendor{' '}
                        {p.vendorId}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-medium rounded-full px-2.5 py-1',
                          p.active ? 'bg-emerald/15 text-emerald' : 'bg-onLight/10 text-onLight/45',
                        )}
                      >
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() =>
                          dispatch(setProductActive({ productId: p.id, active: !p.active }))
                        }
                        className="text-xs font-medium border border-onLight/15 rounded-full px-3 py-1.5 hover:bg-onLight/5"
                      >
                        {p.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'All orders' && (
            <div className="flex flex-col gap-3">
              {orders.length === 0 && (
                <p className="text-sm text-onLight/45">No orders yet.</p>
              )}
              {orders.map((o) => {
                const meta = orderStatusMeta(o.status)
                return (
                  <div
                    key={o.id}
                    className="bg-white border border-onLight/10 rounded-xl p-4 flex justify-between items-start gap-4 flex-wrap"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        ₦{(o.total || 0).toLocaleString()} · {o.customerName || o.customerEmail}
                      </div>
                      <div className="text-xs text-onLight/45 mt-0.5">
                        {o.paymentStatus} · {o.paymentReference || '—'} ·{' '}
                        {o.placedAt ? new Date(o.placedAt).toLocaleString() : ''}
                      </div>
                      <div className="text-xs text-onLight/40 mt-1">
                        {(o.items || []).map((i) => i.productName).join(', ')}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={cn('text-xs font-medium rounded-full px-3 py-1.5', meta.className)}>
                        {meta.label}
                      </span>
                      {o.status === 'Processing' && (
                        <button
                          onClick={() =>
                            dispatch(updateOrderStatus({ orderId: o.id, status: 'In transit' }))
                          }
                          className="text-xs font-medium bg-leaf/15 text-leaf-dim rounded-full px-3 py-1.5"
                        >
                          Mark in transit
                        </button>
                      )}
                      {o.status === 'In transit' && (
                        <button
                          onClick={() =>
                            dispatch(updateOrderStatus({ orderId: o.id, status: 'Delivered' }))
                          }
                          className="text-xs font-medium bg-emerald/15 text-emerald rounded-full px-3 py-1.5"
                        >
                          Mark delivered
                        </button>
                      )}
                      {o.status === 'AwaitingConfirmation' && (
                        <button
                          onClick={() => dispatch(confirmTransaction(o.id))}
                          className="text-xs font-medium bg-emerald/15 text-emerald rounded-full px-3 py-1.5"
                        >
                          Confirm
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {section === 'Activity Log' && (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-onLight/40 mb-2 flex items-center gap-1.5">
                <Activity size={14} /> Audit trail — logins, orders, listings, admin actions.
              </p>
              {activityLog.length === 0 && (
                <p className="text-sm text-onLight/45">No activity yet.</p>
              )}
              {activityLog.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between text-sm bg-white border border-onLight/10 rounded-xl px-4 py-3 gap-4"
                >
                  <span className="text-onLight/70">
                    User {a.userId} — {String(a.action).replaceAll('_', ' ')}
                  </span>
                  <span className="text-onLight/35 text-xs shrink-0">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {section === 'Dashboard Curation' && (
            <div>
              <p className="text-xs text-onLight/40 mb-4 flex items-center gap-1.5">
                <LayoutGrid size={14} /> Platform-level curation for the customer feed.
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((c) => (
                  <button
                    key={c}
                    onClick={() => dispatch(toggleFeaturedCategory(c))}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm border transition-colors',
                      (dashboardCuration.featuredCategories || []).includes(c)
                        ? 'bg-leaf text-white border-leaf'
                        : 'border-onLight/15 text-onLight/60',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
