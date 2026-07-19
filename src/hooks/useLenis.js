import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Landing-page-only: dashboards stay snappy per the brief's performance note.
export default function useLenis() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    // `lerp` (a per-frame interpolation factor) instead of `duration` +
    // `easing`. Duration-based easing was the cause of the trackpad lag:
    // it re-runs a full easing curve for every little wheel delta a
    // trackpad fires, which stacks up and feels sluggish. `lerp` just
    // chases the target position a fixed fraction closer every frame —
    // much closer to native scroll feel, especially under a trackpad's
    // rapid, small-delta input.
    const lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    let id
    function raf(time) {
      lenis.raf(time)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])
}
