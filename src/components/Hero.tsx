import { Bot, ShieldCheck, ScrollText } from 'lucide-react'
import type { ComponentType } from 'react'

interface Pillar {
  label: string
  detail: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const pillars: Pillar[] = [
  {
    label: 'Autonomous Execution',
    detail: 'Agents route, validate, and notify',
    icon: Bot,
  },
  {
    label: 'Early Validation Gate',
    detail: 'Issues caught before auditor review',
    icon: ShieldCheck,
  },
  {
    label: 'Audit Transparency',
    detail: 'Every decision explained and logged',
    icon: ScrollText,
  },
]

export function Hero() {
  return (
    <section
      aria-label="Product narrative"
      className="relative overflow-hidden rounded-xl border border-blue-200/70 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-[0_4px_20px_-8px_rgba(30,64,175,0.55)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_55%),radial-gradient(circle_at_85%_70%,rgba(56,189,248,0.25),transparent_55%)]"
      />
      <div className="relative px-6 py-5 md:px-8 md:py-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/90">
            PBC Management Orchestrator
          </p>
          <h1 className="mt-1.5 text-2xl md:text-[28px] font-semibold leading-tight tracking-tight">
            End-to-End PBC Orchestration for a Smarter, Faster Audit Cycle
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            AI agents generate risk-based requests, validate submissions on arrival, and route only
            audit-ready packages to your team — closing the loop with POCs in real time.
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 lg:max-w-md">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <li
                key={p.label}
                className="rounded-lg bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-sm px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/15 ring-1 ring-inset ring-white/25">
                    <Icon size={13} strokeWidth={2.25} className="text-white" />
                  </span>
                  <span className="text-[12px] font-semibold tracking-tight text-white">
                    {p.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-blue-100/85 leading-snug">{p.detail}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
