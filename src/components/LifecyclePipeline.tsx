import clsx from 'clsx'
import {
  Bot,
  Check,
  CheckCircle2,
  CloudUpload,
  FileSearch,
  Gavel,
  Loader2,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { PbcDocument, ValidationResult } from '../types'
import { Card, CardBody, CardHeader } from './ui/Card'

type StageKey = 'generated' | 'uploaded' | 'validating' | 'decided' | 'routed'

interface Stage {
  key: StageKey
  label: string
  caption: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const stages: Stage[] = [
  { key: 'generated', label: 'Request Generated', caption: 'AI risk-based scoping', icon: Sparkles },
  { key: 'uploaded', label: 'Document Uploaded', caption: 'Detected via SharePoint', icon: CloudUpload },
  { key: 'validating', label: 'AI Validation', caption: 'Early Validation Gate', icon: FileSearch },
  { key: 'decided', label: 'Decision', caption: 'Auto-Accept or Auto-Reject', icon: Gavel },
  { key: 'routed', label: 'Routed', caption: 'Auditor or POC follow-up', icon: UserCheck },
]

type StageState = 'done' | 'active' | 'pending' | 'success' | 'failure'

function computeStageStates(
  doc: PbcDocument,
  isRunning: boolean,
  result?: ValidationResult,
): Record<StageKey, StageState> {
  const states: Record<StageKey, StageState> = {
    generated: 'done',
    uploaded: 'done',
    validating: 'pending',
    decided: 'pending',
    routed: 'pending',
  }

  if (isRunning) {
    states.validating = 'active'
    return states
  }

  if (result) {
    states.validating = 'done'
    states.decided = result.decision === 'AUTO_ACCEPT' ? 'success' : 'failure'
    states.routed = result.decision === 'AUTO_ACCEPT' ? 'success' : 'failure'
    return states
  }

  if (doc.status === 'Pending Validation') {
    states.validating = 'active'
  }
  return states
}

function nodeClasses(state: StageState): string {
  switch (state) {
    case 'success':
      return 'bg-emerald-500 text-white ring-emerald-200'
    case 'failure':
      return 'bg-rose-500 text-white ring-rose-200'
    case 'done':
      return 'bg-blue-600 text-white ring-blue-200'
    case 'active':
      return 'bg-white text-blue-700 ring-blue-300 ring-2'
    default:
      return 'bg-white text-slate-400 ring-slate-200'
  }
}

function connectorClasses(left: StageState, right: StageState): string {
  const leftDone =
    left === 'done' || left === 'success' || left === 'failure' || left === 'active'
  const rightDone = right === 'done' || right === 'success' || right === 'failure'
  if (rightDone || (leftDone && right === 'active')) {
    if (left === 'failure' || right === 'failure') return 'bg-rose-300'
    if (left === 'success' || right === 'success') return 'bg-emerald-400'
    return 'bg-blue-400'
  }
  return 'bg-slate-200'
}

interface Props {
  document: PbcDocument
  result?: ValidationResult
  isRunning: boolean
}

export function LifecyclePipeline({ document: doc, result, isRunning }: Props) {
  const states = computeStageStates(doc, isRunning, result)

  return (
    <Card>
      <CardHeader
        title="Submission Lifecycle"
        description={`Tracking ${doc.id} · ${doc.title}`}
        right={
          <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <Bot size={12} className="text-blue-600" strokeWidth={2.25} />
            Orchestrated by AI agents
          </span>
        }
      />
      <CardBody>
        <ol className="flex items-stretch gap-0">
          {stages.map((stage, i) => {
            const state = states[stage.key]
            const Icon = stage.icon
            const isLast = i === stages.length - 1
            return (
              <li key={stage.key} className="flex-1 min-w-0 flex flex-col">
                <div className="relative flex items-center">
                  <span
                    className={clsx(
                      'relative z-10 inline-flex h-9 w-9 items-center justify-center rounded-full ring-4 transition-all',
                      nodeClasses(state),
                    )}
                  >
                    {state === 'active' ? (
                      <Loader2 size={15} strokeWidth={2.25} className="animate-spin" />
                    ) : state === 'success' ? (
                      <CheckCircle2 size={16} strokeWidth={2.5} />
                    ) : state === 'failure' ? (
                      <XCircle size={16} strokeWidth={2.5} />
                    ) : state === 'done' ? (
                      <Check size={15} strokeWidth={3} />
                    ) : (
                      <Icon size={14} strokeWidth={2.25} />
                    )}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden
                      className={clsx(
                        'flex-1 h-1 mx-0 rounded-full transition-colors',
                        connectorClasses(states[stage.key], states[stages[i + 1].key]),
                      )}
                    />
                  )}
                </div>
                <div className="mt-2 pr-3">
                  <div
                    className={clsx(
                      'text-[12px] font-semibold leading-tight',
                      state === 'pending' ? 'text-slate-500' : 'text-slate-900',
                      state === 'failure' && 'text-rose-700',
                      state === 'success' && 'text-emerald-700',
                    )}
                  >
                    {stage.label}
                  </div>
                  <div
                    className={clsx(
                      'text-[11px] leading-tight mt-0.5',
                      state === 'pending' ? 'text-slate-400' : 'text-slate-500',
                    )}
                  >
                    {stage.key === 'routed' && state === 'failure'
                      ? 'Returned to POC for correction'
                      : stage.key === 'routed' && state === 'success'
                        ? `Notified ${doc.auditorName}`
                        : stage.caption}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </CardBody>
    </Card>
  )
}
