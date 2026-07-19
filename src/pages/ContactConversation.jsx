import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Mail,
  MessageCircle,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'

const EMAIL = 'hello@oscillate.com'
const PARTNER_EMAIL = 'partners@oscillate.com'

const socials = [
  {
    name: 'Instagram',
    handle: '@oscillatemarketing',
    href: 'https://instagram.com/oscillatemarketing',
    icon: Instagram,
    blurb: 'Product drops, maker stories, and community highlights.',
  },
  {
    name: 'X (Twitter)',
    handle: '@oscillatemarketing',
    href: 'https://x.com/oscillatemarketing',
    icon: Twitter,
    blurb: 'Platform updates and marketplace news.',
  },
  {
    name: 'LinkedIn',
    handle: 'Oscillate Marketing',
    href: 'https://linkedin.com/company/oscillate-marketing',
    icon: Linkedin,
    blurb: 'Partnerships, hiring, and investor conversations.',
  },
  {
    name: 'Facebook',
    handle: 'Oscillate Marketing',
    href: 'https://facebook.com/oscillatemarketing',
    icon: Facebook,
    blurb: 'Community support and event announcements.',
  },
]

const emailChannels = [
  {
    title: 'General support',
    email: EMAIL,
    description: 'Account help, orders, product questions, or something not working right.',
  },
  {
    title: 'Partnerships & press',
    email: PARTNER_EMAIL,
    description: 'Platform partnerships, category collaborations, and media inquiries.',
  },
]

export default function ContactConversation() {
  const user = useSelector((s) => s.auth.user)
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <div className="container-page py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 text-xs font-medium text-leaf-dim bg-leaf/10 border border-leaf/20 rounded-full px-3 py-1.5 mb-5">
            <ShieldCheck size={13} /> Account verified — you can reach us
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Start a conversation
          </h1>
          <p className="mt-4 text-lg text-onLight/60 max-w-xl">
            Hi {firstName}. Pick a channel below — email us directly or find us on socials.
            We keep this page for members only so we can match messages to real accounts.
          </p>
        </motion.div>

        {/* Email channels */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4 }}
          className="mt-12"
        >
          <div className="flex items-center gap-2 mb-5">
            <Mail size={18} className="text-leaf-dim" />
            <h2 className="font-display text-xl font-semibold">Send an email</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {emailChannels.map((channel) => (
              <div
                key={channel.email}
                className="rounded-2xl bg-white border border-onLight/10 p-6 flex flex-col"
              >
                <h3 className="font-semibold text-onLight">{channel.title}</h3>
                <p className="text-sm text-onLight/55 mt-2 flex-1">{channel.description}</p>
                <Button
                  as="a"
                  href={`mailto:${channel.email}?subject=Oscillate%20inquiry%20from%20${encodeURIComponent(user?.name || 'member')}`}
                  variant="outline"
                  className="w-full mt-5"
                >
                  <Mail size={16} />
                  {channel.email}
                </Button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Socials */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.4 }}
          className="mt-14"
        >
          <div className="flex items-center gap-2 mb-5">
            <MessageCircle size={18} className="text-leaf-dim" />
            <h2 className="font-display text-xl font-semibold">Find us on socials</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl bg-white border border-onLight/10 p-5 flex gap-4 items-start hover:border-leaf/35 hover:shadow-sm transition-all"
              >
                <div className="size-11 rounded-full bg-leaf/10 border border-leaf/15 flex items-center justify-center shrink-0 group-hover:bg-leaf/15 transition-colors">
                  <social.icon size={20} className="text-leaf-dim" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-onLight">{social.name}</span>
                    <ExternalLink
                      size={14}
                      className="text-onLight/30 group-hover:text-leaf-dim transition-colors"
                    />
                  </div>
                  <div className="text-sm text-leaf-dim mt-0.5">{social.handle}</div>
                  <p className="text-sm text-onLight/50 mt-2">{social.blurb}</p>
                </div>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Quick tip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.4 }}
          className="mt-12 rounded-2xl border border-onLight/10 bg-canopy/[0.04] p-6 max-w-2xl"
        >
          <p className="text-sm text-onLight/65 leading-relaxed">
            Prefer a reply tied to your account? Email from the address on file
            {user?.email ? (
              <>
                {' '}
                (<span className="font-medium text-onLight">{user.email}</span>)
              </>
            ) : null}{' '}
            and include a short note about whether you&apos;re shopping, selling, or exploring a
            partnership. We typically respond within 1–2 business days.
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
