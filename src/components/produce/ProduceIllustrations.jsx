import { useId } from 'react'

export function Tomato({ size = 56, className, rotate = 0 }) {
  const id = useId()
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <radialGradient id={`tom-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FF7A6E" />
          <stop offset="55%" stopColor="#E5484D" />
          <stop offset="100%" stopColor="#B4302F" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="22" r="15" fill={`url(#tom-${id})`} />
      <ellipse cx="14" cy="15" rx="4.5" ry="3" fill="#FFFFFF" opacity="0.3" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx="20"
          cy="7"
          rx="2.4"
          ry="4.2"
          fill="#3FBF6B"
          transform={`rotate(${a} 20 9)`}
        />
      ))}
    </svg>
  )
}

export function BananaBunch({ size = 60, className, rotate = 0 }) {
  const id = useId()
  return (
    <svg width={size} height={size * 0.68} viewBox="0 0 56 34" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <linearGradient id={`ban-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D566" />
          <stop offset="100%" stopColor="#E0A030" />
        </linearGradient>
      </defs>
      {[0, 9, -8].map((dy, i) => (
        <path
          key={i}
          d={`M4 ${26 + dy} C 10 ${8 + dy}, 34 ${2 + dy}, 50 ${10 + dy} C 36 ${14 + dy}, 14 ${18 + dy}, 4 ${26 + dy} Z`}
          fill={`url(#ban-${id})`}
          opacity={i === 0 ? 1 : 0.92}
        />
      ))}
      <circle cx="50" cy="10" r="2.4" fill="#6B4A1E" />
      <circle cx="4" cy="26" r="2.2" fill="#6B4A1E" />
    </svg>
  )
}

export function GrapeCluster({ size = 46, className, rotate = 0 }) {
  const id = useId()
  const dots = [
    [17, 4], [10, 10], [24, 10], [4, 17], [17, 17], [30, 17],
    [10, 24], [24, 24], [17, 30],
  ]
  return (
    <svg width={size} height={size} viewBox="0 0 34 40" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <radialGradient id={`grp-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#B79BE0" />
          <stop offset="60%" stopColor="#7C5CBF" />
          <stop offset="100%" stopColor="#553E8A" />
        </radialGradient>
      </defs>
      <path d="M15 2 Q19 -2 22 2 L20 6 Q17 4 15 2 Z" fill="#3FBF6B" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy + 4} r="5" fill={`url(#grp-${id})`} />
      ))}
    </svg>
  )
}

export function Pepper({ size = 50, className, color = 'red', rotate = 0 }) {
  const id = useId()
  const stops = color === 'red' ? ['#FF6B57', '#E5484D', '#A8302E'] : ['#7CDB93', '#3FBF6B', '#237A44']
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 34 40" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <radialGradient id={`pep-${id}`} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="55%" stopColor={stops[1]} />
          <stop offset="100%" stopColor={stops[2]} />
        </radialGradient>
      </defs>
      <path
        d="M17 10 C 27 10 30 20 27 30 C 24 38 10 38 7 30 C 4 20 7 10 17 10 Z"
        fill={`url(#pep-${id})`}
      />
      <path d="M15 10 C14 6 16 3 19 2" stroke="#3FBF6B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="13" cy="16" rx="3" ry="5" fill="#FFFFFF" opacity="0.25" />
    </svg>
  )
}

export function CornStalk({ size = 60, className, rotate = 0 }) {
  const id = useId()
  return (
    <svg width={size * 0.5} height={size} viewBox="0 0 24 52" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <linearGradient id={`corn-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D566" />
          <stop offset="100%" stopColor="#D9A62E" />
        </linearGradient>
      </defs>
      <path d="M8 50 C4 30 6 10 12 2 C18 10 20 30 16 50 Z" fill={`url(#corn-${id})`} />
      {[8, 14, 20, 26, 32, 38].map((y) => (
        <g key={y}>
          <circle cx="9" cy={y} r="1.6" fill="#B4801E" opacity="0.5" />
          <circle cx="15" cy={y + 3} r="1.6" fill="#B4801E" opacity="0.5" />
        </g>
      ))}
      <path d="M12 8 C2 12 -2 28 4 44" stroke="#3FBF6B" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M14 6 C24 10 26 26 20 42" stroke="#2E9C55" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function LeafyGreen({ size = 60, className, rotate = 0 }) {
  const id = useId()
  return (
    <svg width={size * 0.6} height={size} viewBox="0 0 28 56" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <linearGradient id={`leaf-${id}`} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#2E9C55" />
          <stop offset="100%" stopColor="#7CDB93" />
        </linearGradient>
      </defs>
      {[[-6, 0], [0, -4], [6, 0]].map(([dx, dy], i) => (
        <path
          key={i}
          d={`M14 54 C ${13 + dx} 30, ${12 + dx} 14, ${14 + dx} ${2 + dy} C ${16 + dx} 14, ${15 + dx} 30, 14 54 Z`}
          fill={`url(#leaf-${id})`}
          opacity={0.95 - i * 0.08}
        />
      ))}
    </svg>
  )
}

export function Lemon({ size = 44, className, rotate = 0 }) {
  const id = useId()
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 40 32" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
      <defs>
        <radialGradient id={`lem-${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FCE98C" />
          <stop offset="60%" stopColor="#E0A030" />
          <stop offset="100%" stopColor="#B47A1E" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="16" rx="18" ry="13" fill={`url(#lem-${id})`} />
      <ellipse cx="14" cy="10" rx="4" ry="2.4" fill="#FFFFFF" opacity="0.3" />
      <path d="M36 14 C39 15 39 18 36 19" stroke="#3FBF6B" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
