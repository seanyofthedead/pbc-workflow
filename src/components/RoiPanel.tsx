import { Repeat, Timer, TrendingDown, Zap } from 'lucide-react'
import type { ComponentType } from 'react'
import { Card, CardBody, CardHeader } from './ui/Card'

interface Metric {
  label: string
  value: string
  detail: string
  icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
}

const metrics: Metric[] = [
  {
    label: 'Cycle Time Reduction',
    value: '62%',
    detail: 'Median PBC turnaround dropped from 5.4 days to 2.1 days.',
    icon: TrendingDown,
  },
  {
    label: 'Touchless Processing',
    value: '73%',
    detail: '3 of every 4 submissions clear the AI gate without human triage.',
    icon: Zap,
  },
  {
    label: 'Hours Saved / Cycle',
    value: '37 hrs',
    detail: 'Coordinator time recovered for high-judgment audit work.',
    icon: Timer,
  },
  {
    label: 'Rework Loops',
    value: '−51%',
    detail: 'Itemized rejection feedback halves back-and-forth with POCs.',
    icon: Repeat,
  },
]

export function RoiPanel() {
  return (
    <Card>
      <CardHeader
        title="ROI Snapshot"
        description="Indicative metrics — replace with telemetry once integrated."
      />
      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <div
                key={m.label}
                className="rounded-md border border-slate-200 p-4 bg-slate-50/40"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-medium uppercase tracking-wide">
                    {m.label}
                  </span>
                  <Icon size={14} className="text-blue-600" strokeWidth={2.25} />
                </div>
                <div className="text-2xl font-semibold text-slate-900 mt-1.5">
                  {m.value}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-snug">{m.detail}</p>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}
