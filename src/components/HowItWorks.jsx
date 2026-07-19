import Reveal from '@/components/Reveal'

const steps = [
  { n: '01', title: 'Find something worth buying', body: 'Browse a feed shaped by your interests, not by whoever paid for placement.' },
  { n: '02', title: 'Buy straight from the maker', body: 'Every vendor is identity-verified before their first listing goes live.' },
  { n: '03', title: 'Say how it went', body: 'Rate the product, and separately, the vendor — delivery and communication included.' },
]

export default function HowItWorks() {
  return (
    <section className="bg-paper py-28">
      <div className="container-page">
        <Reveal className="mb-14 max-w-lg">
          <span className="text-sm font-medium text-leaf-dim">How Oscillate works</span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold mt-3 leading-tight">
            Three steps. No noise.
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.12}>
              <span className="font-display text-6xl md:text-7xl font-semibold text-leaf/15 leading-none">
                {step.n}
              </span>
              <h3 className="font-semibold text-lg mt-4 mb-2">{step.title}</h3>
              <p className="text-onLight/55 text-sm leading-relaxed max-w-xs">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
