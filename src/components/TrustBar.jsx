import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react'
import Reveal from '@/components/Reveal'

const items = [
  { icon: Truck, title: 'Free shipping', sub: 'On orders over ₦50,000' },
  { icon: ShieldCheck, title: 'Secure payments', sub: 'Every vendor ID-verified' },
  { icon: RotateCcw, title: 'Easy returns', sub: '7-day return window' },
  { icon: Headphones, title: '24/7 support', sub: 'Real humans, always on' },
]

export default function TrustBar() {
  return (
    <section className="bg-white border-y border-onLight/8">
      <div className="container-page py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05} className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-leaf/10 flex items-center justify-center shrink-0">
              <item.icon size={17} className="text-leaf-dim" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-sm font-medium leading-tight">{item.title}</div>
              <div className="text-xs text-onLight/45 leading-tight mt-0.5">{item.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
