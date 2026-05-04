import {
  CheckCircle2,
  Clock,
  FileStack,
  Gauge,
  Timer,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { PbcDocument } from '../types'

interface Tile {
  label: string
  value: string
  hint: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  accent: string
}

export function KpiTiles({ documents }: { documents: PbcDocument[] }) {
  const total = documents.length
  const pending = documents.filter((d) => d.status === 'Pending Validation').length
  const accepted = documents.filter((d) => d.status === 'Auto-Accepted').length
  const rejected = documents.filter(
    (d) => d.status === 'Auto-Rejected' || d.status === 'Awaiting Resubmission',
  ).length

  const tiles: Tile[] = [
    {
      label: 'Total Requests',
      value: String(total),
      hint: 'This audit cycle',
      icon: FileStack,
      accent: 'text-slate-500',
    },
    {
      label: 'Pending Validation',
      value: String(pending),
      hint: 'Awaiting AI gate',
      icon: Clock,
      accent: 'text-amber-600',
    },
    {
      label: 'Auto-Accepted',
      value: String(accepted),
      hint: 'Routed to auditor',
      icon: CheckCircle2,
      accent: 'text-emerald-600',
    },
    {
      label: 'Auto-Rejected',
      value: String(rejected),
      hint: 'Sent back to POC',
      icon: XCircle,
      accent: 'text-rose-600',
    },
    {
      label: 'Touchless Processing',
      value: '73%',
      hint: 'Last 30 days',
      icon: Gauge,
      accent: 'text-blue-600',
    },
    {
      label: 'Cycle Time Reduction',
      value: '62%',
      hint: 'Vs. manual baseline',
      icon: TrendingUp,
      accent: 'text-violet-600',
    },
    {
      label: 'Hours Saved / Cycle',
      value: '37 hrs',
      hint: 'Coordinator team',
      icon: Timer,
      accent: 'text-blue-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      {tiles.map((t) => {
        const Icon = t.icon
        return (
          <div
            key={t.label}
            className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-medium uppercase tracking-wide">
                {t.label}
              </span>
              <Icon size={16} className={t.accent} strokeWidth={2.25} />
            </div>
            <div className="mt-1.5 text-2xl font-semibold text-slate-900 tracking-tight">
              {t.value}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{t.hint}</div>
          </div>
        )
      })}
    </div>
  )
}
