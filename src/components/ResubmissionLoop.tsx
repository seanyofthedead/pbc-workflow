import {
  ArrowRight,
  Inbox,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import type { ComponentType } from 'react'

interface Step {
  label: string
  detail: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const steps: Step[] = [
  {
    label: 'POC receives instructions',
    detail: 'Itemized fixes delivered via Outlook + Power Apps card',
    icon: Inbox,
  },
  {
    label: 'POC corrects submission',
    detail: 'Fixes only the flagged fields — no full rework',
    icon: Wrench,
  },
  {
    label: 'Document resubmitted',
    detail: 'Replaces the prior version in SharePoint',
    icon: RefreshCw,
  },
  {
    label: 'AI revalidates instantly',
    detail: 'Same gate re-runs; auditor notified on pass',
    icon: ShieldCheck,
  },
]

export function ResubmissionLoop() {
  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <div className="text-[12px] font-semibold text-slate-900 leading-tight">
          Closed-Loop Resubmission
        </div>
        <div className="text-[11px] text-slate-500 leading-tight">
          What happens after the rejection — no human coordinator required
        </div>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-4 gap-0 sm:gap-1 p-3">
        {steps.map((step, i) => {
          const Icon = step.icon
          const isLast = i === steps.length - 1
          return (
            <li
              key={step.label}
              className="relative flex sm:flex-col sm:items-start gap-3 sm:gap-2 px-2.5 py-2"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                <Icon size={15} strokeWidth={2.25} />
              </span>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-slate-900 leading-tight">
                  {i + 1}. {step.label}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  {step.detail}
                </div>
              </div>
              {!isLast && (
                <ArrowRight
                  size={14}
                  strokeWidth={2.25}
                  className="hidden sm:block absolute -right-1 top-3 text-slate-300"
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
