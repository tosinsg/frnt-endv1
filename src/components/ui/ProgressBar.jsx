import { motion } from 'framer-motion'

export default function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-onLight/50 mb-2">
        <span>Step {step} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-onLight/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-leaf"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}
