import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Wraps a section so it fades + slides up as it scrolls into view.
// This is the one reusable primitive that implements Section 6's
// "fade + slight upward slide as each section scrolls into view" direction.
export default function Reveal({ children, as: Tag = 'div', className = '', delay = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 32 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            // Play once — reverse-on-leave felt janky and re-ran work on scroll-up
            toggleActions: 'play none none none',
            once: true,
          },
        },
      )
    }, ref)
    return () => ctx.revert()
  }, [delay])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
