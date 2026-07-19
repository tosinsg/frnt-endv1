// Cloudinary helpers: delivery URL builder + authenticated upload via backend.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'
const API_BASE = import.meta.env.VITE_API_URL || '/api'

/**
 * Build a Cloudinary delivery URL for a given public ID.
 * @param {string} publicId - e.g. "products/raffia-tote"
 * @param {{ width?: number, height?: number, crop?: string }} opts
 */
export function cloudinaryUrl(publicId, opts = {}) {
  const { width = 600, height, crop = 'fill' } = opts
  const transforms = [`f_auto`, `q_auto`, `c_${crop}`, `w_${width}`]
  if (height) transforms.push(`h_${height}`)
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`
}

/**
 * Upload a vendor document through the backend (signed Cloudinary upload).
 * Returns { url, cloudinaryConfigured }.
 * @param {File} file
 * @param {(pct: number) => void} [onProgress] — reserved for future XHR progress
 */
export async function uploadVendorDoc(file) {
  if (!file) throw new Error('No file selected')

  const form = new FormData()
  form.append('file', file)

  const token = localStorage.getItem('aro_token')
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/uploads/vendor-doc`, {
    method: 'POST',
    headers,
    body: form,
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
}
