import { Cpu, Shirt, Home, Sparkles, Dumbbell, BookOpen, Package } from 'lucide-react'

export const CATEGORY_TINTS = {
  Electronics: { bg: 'bg-canopy/8', icon: 'text-canopy', Icon: Cpu },
  Fashion: { bg: 'bg-leaf/10', icon: 'text-leaf-dim', Icon: Shirt },
  Home: { bg: 'bg-slate/10', icon: 'text-slate', Icon: Home },
  Beauty: { bg: 'bg-amber/10', icon: 'text-amber', Icon: Sparkles },
  Sports: { bg: 'bg-emerald/10', icon: 'text-emerald', Icon: Dumbbell },
  Books: { bg: 'bg-coral/10', icon: 'text-coral', Icon: BookOpen },
  default: { bg: 'bg-onLight/5', icon: 'text-onLight/30', Icon: Package },
}
