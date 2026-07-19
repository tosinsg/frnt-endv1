import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import Button from '@/components/ui/Button'

// Counts down to the next midnight, so it's always a live, real countdown
// without needing a backend-set end time yet.
function getTargetTime() {
  const target = new Date()
  target.setHours(24, 0, 0, 0)
  return target
}

function useCountdown() {
  const [remaining, setRemaining] = useState(() => getTargetTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRemaining(getTargetTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const clamped = Math.max(0, remaining)
  const hours = String(Math.floor(clamped / 3_600_000)).padStart(2, '0')
  const minutes = String(Math.floor((clamped % 3_600_000) / 60_000)).padStart(2, '0')
  const seconds = String(Math.floor((clamped % 60_000) / 1000)).padStart(2, '0')
  return { hours, minutes, seconds }
}

export default function FlashSaleBanner() {
  const navigate = useNavigate()
  const { hours, minutes, seconds } = useCountdown()

  return (
    <section className="bg-canopy py-14">
      <div className="container-page flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-leaf/20 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-leaf" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-onDark">
              Flash deals — up to 40% off
            </h2>
            <p className="text-onDark/50 text-sm mt-1">Ends when the clock below hits zero.</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex gap-2">
            {[hours, minutes, seconds].map((unit, i) => (
              <div key={i} className="bg-white/10 rounded-xl px-3.5 py-2.5 text-center min-w-[56px]">
                <div className="font-display text-xl font-semibold text-onDark tabular-nums">{unit}</div>
                <div className="text-[10px] text-onDark/40 uppercase tracking-wide mt-0.5">
                  {['hrs', 'min', 'sec'][i]}
                </div>
              </div>
            ))}
          </div>
          <Button variant="primary" size="lg" onClick={() => navigate('/products')}>
            Shop deals
          </Button>
        </div>
      </div>
    </section>
  )
}
