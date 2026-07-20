import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import { updateProfile } from '@/store/slices/authSlice'
import { routeForUser } from '@/lib/authRoutes'
import { cn } from '@/lib/utils'

const accents = ['#3FBF6B', '#123D0A', '#2E7D5B', '#E0A030']
const templates = ['Minimal', 'Bold', 'Editorial']

export default function ProfileCustomization() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const isVendor = user?.role === 'vendor'
  const existing = user?.profileCustomization || {}
  const [accent, setAccent] = useState(existing.accentColor || accents[0])
  const [template, setTemplate] = useState(existing.template || templates[0])
  const [displayName, setDisplayName] = useState(existing.displayName || user?.name || '')
  const [bio, setBio] = useState(existing.bio || '')
  const [shopDesc, setShopDesc] = useState(existing.shopDescription || '')
  const [social, setSocial] = useState(existing.socialLink || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    setSaving(true)
    setMessage('')
    const result = await dispatch(
      updateProfile({
        displayName,
        bio: isVendor ? undefined : bio,
        shopDescription: isVendor ? shopDesc : undefined,
        socialLink: isVendor ? social : undefined,
        accentColor: accent,
        template,
      }),
    )
    setSaving(false)
    setMessage(updateProfile.fulfilled.match(result) ? 'Saved.' : result.payload || 'Save failed')
  }

  const dashboardPath = routeForUser(user)
  const dashboardLabel =
    (user?.role || '').toLowerCase() === 'admin'
      ? 'Back to admin dashboard'
      : (user?.role || '').toLowerCase() === 'vendor'
        ? 'Back to vendor dashboard'
        : 'Back to dashboard'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-16 grid md:grid-cols-[1fr_320px] gap-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to={dashboardPath}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-leaf-dim hover:text-leaf mb-5 transition-colors"
          >
            <ArrowLeft size={16} />
            {dashboardLabel}
          </Link>
          <h1 className="font-display text-3xl font-semibold mb-1">
            {isVendor ? 'Customize your shop page' : 'Customize your profile'}
          </h1>
          <p className="text-onLight/50 text-sm mb-8">
            {isVendor
              ? 'This is what customers see when they visit your shop.'
              : 'A lighter profile — avatar, bio, and accent color.'}
          </p>

          <div className="space-y-6 max-w-md">
            <Field label="Display name">
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </Field>
            <Field label={isVendor ? 'Shop description' : 'Bio'}>
              <textarea
                value={isVendor ? shopDesc : bio}
                onChange={(e) => (isVendor ? setShopDesc(e.target.value) : setBio(e.target.value))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf focus:ring-1 focus:ring-leaf"
                placeholder={
                  isVendor
                    ? 'What does your shop sell, and what makes it different?'
                    : 'A little about you'
                }
              />
            </Field>
            {isVendor && (
              <Field label="Social links">
                <Input
                  placeholder="instagram.com/yourshop"
                  value={social}
                  onChange={(e) => setSocial(e.target.value)}
                />
              </Field>
            )}

            <div>
              <span className="block text-sm font-medium text-onLight/80 mb-2">Theme accent</span>
              <div className="flex gap-3">
                {accents.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAccent(c)}
                    style={{ backgroundColor: c }}
                    className={cn(
                      'size-9 rounded-full border-2',
                      accent === c ? 'border-onLight' : 'border-transparent',
                    )}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="block text-sm font-medium text-onLight/80 mb-2">Template</span>
              <div className="flex gap-2">
                {templates.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm border',
                      template === t
                        ? 'border-leaf text-leaf bg-leaf/5'
                        : 'border-onLight/15 text-onLight/60',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {message && <p className="text-sm text-leaf">{message}</p>}
            <Button size="lg" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-onLight/10 bg-white overflow-hidden h-fit sticky top-24">
          <div className="h-24" style={{ backgroundColor: accent }} />
          <div className="p-5">
            <div className="size-14 rounded-full bg-onLight/10 -mt-12 border-4 border-white mb-3" />
            <div className="font-semibold text-sm">{displayName || 'Your name'}</div>
            <p className="text-xs text-onLight/50 mt-1">
              {(isVendor ? shopDesc : bio) ||
                (isVendor ? 'Your shop description will appear here.' : 'Your bio will appear here.')}
            </p>
            <span className="inline-block mt-3 text-[11px] text-onLight/35">{template} template</span>
          </div>
        </div>
      </div>
    </div>
  )
}
