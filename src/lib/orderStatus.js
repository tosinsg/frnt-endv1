/**
 * Shared order status labels + styles for customer & admin UIs.
 * Backend lifecycle:
 *   PendingPayment → AwaitingConfirmation → Processing → In transit → Delivered
 *   Failed | Cancelled
 */

const STATUS_META = {
  PendingPayment: {
    label: 'Awaiting payment',
    description: 'Complete payment to place this order.',
    className: 'bg-onLight/10 text-onLight/60',
  },
  AwaitingConfirmation: {
    label: 'Waiting for admin',
    description: 'Payment received. Waiting for Oscillate to confirm your order.',
    className: 'bg-amber/15 text-amber',
  },
  Processing: {
    label: 'Confirmed',
    description: 'Admin confirmed — your order is being prepared.',
    className: 'bg-leaf/15 text-leaf-dim',
  },
  'In transit': {
    label: 'In transit',
    description: 'Your order is on the way.',
    className: 'bg-leaf/15 text-leaf-dim',
  },
  Delivered: {
    label: 'Delivered',
    description: 'Order completed.',
    className: 'bg-emerald/15 text-emerald',
  },
  Failed: {
    label: 'Payment failed',
    description: 'Payment did not go through.',
    className: 'bg-coral/15 text-coral',
  },
  Cancelled: {
    label: 'Cancelled',
    description: 'This order was cancelled.',
    className: 'bg-coral/15 text-coral',
  },
}

export function orderStatusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status || 'Unknown',
      description: '',
      className: 'bg-onLight/10 text-onLight/55',
    }
  )
}

export function isAwaitingAdmin(status) {
  return status === 'AwaitingConfirmation'
}
