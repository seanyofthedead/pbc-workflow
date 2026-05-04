import clsx from 'clsx'
import {
  ArrowRight,
  ChevronLeft,
  Pause,
  Play,
  RefreshCcw,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { demoSteps, type DemoTargetId } from './demo-steps'

export type { DemoTargetId } from './demo-steps'

interface Props {
  active: boolean
  step: number
  onStart: () => void
  onExit: () => void
  onNext: () => void
  onPrev: () => void
  onRestart: () => void
}

export function DemoModeControls({
  active,
  step,
  onStart,
  onExit,
  onNext,
  onPrev,
  onRestart,
}: Props) {
  if (!active) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 shadow-lg shadow-blue-600/25 ring-1 ring-blue-700/40 transition-colors"
      >
        <Play size={14} strokeWidth={2.5} />
        Start Guided Demo
      </button>
    )
  }

  const current = demoSteps[step]
  const isLast = step === demoSteps.length - 1

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[360px] max-w-[calc(100vw-2.5rem)] rounded-xl bg-slate-900 text-white shadow-2xl ring-1 ring-slate-700">
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-700/70">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-300 ring-1 ring-inset ring-blue-400/40">
            <Play size={12} strokeWidth={2.5} />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
            Guided Demo · Step {step + 1} of {demoSteps.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit demo"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X size={14} strokeWidth={2.25} />
        </button>
      </div>
      <div className="px-4 py-3.5">
        <div className="text-sm font-semibold text-white leading-tight">
          {current.title}
        </div>
        <p className="mt-1.5 text-[12.5px] text-slate-300 leading-snug">{current.body}</p>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={step === 0}
          className={clsx(
            'inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors',
            step === 0
              ? 'text-slate-500 cursor-not-allowed'
              : 'text-slate-200 hover:bg-slate-800',
          )}
        >
          <ChevronLeft size={13} strokeWidth={2.5} />
          Back
        </button>
        <div className="flex items-center gap-1.5">
          {demoSteps.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === step
                  ? 'w-5 bg-blue-400'
                  : i < step
                    ? 'w-1.5 bg-blue-500/70'
                    : 'w-1.5 bg-slate-600',
              )}
            />
          ))}
        </div>
        {isLast ? (
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white px-2.5 py-1.5 text-[12px] font-semibold"
          >
            <RefreshCcw size={13} strokeWidth={2.5} />
            Restart
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-500 hover:bg-blue-400 text-white px-2.5 py-1.5 text-[12px] font-semibold"
          >
            {current.cta ?? 'Next'}
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  )
}

export function DemoSpotlight({
  targetId,
  matches,
  activeTargetId,
  children,
}: {
  targetId: DemoTargetId
  matches?: DemoTargetId[]
  activeTargetId: DemoTargetId | null
  children: ReactNode
}) {
  const candidates = matches ?? [targetId]
  const isActive = activeTargetId !== null && candidates.includes(activeTargetId)
  return (
    <div
      className={clsx(
        'transition-all duration-300 rounded-xl',
        isActive &&
          'ring-4 ring-blue-400/70 ring-offset-4 ring-offset-slate-50 shadow-[0_0_0_8px_rgba(59,130,246,0.08)]',
      )}
      data-demo-target={targetId}
      data-demo-active={isActive ? 'true' : 'false'}
    >
      {children}
    </div>
  )
}

export function DemoPauseHint({
  active,
  onPause,
}: {
  active: boolean
  onPause: () => void
}) {
  if (!active) return null
  return (
    <button
      type="button"
      onClick={onPause}
      className="fixed top-5 right-5 z-40 inline-flex items-center gap-1.5 rounded-full bg-white text-slate-700 text-[11px] font-semibold px-3 py-1.5 shadow-md ring-1 ring-slate-200 hover:bg-slate-50"
    >
      <Pause size={11} strokeWidth={2.5} />
      Demo Mode Active — Click to Exit
    </button>
  )
}
