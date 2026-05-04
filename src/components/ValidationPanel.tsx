import clsx from 'clsx'
import {
  CheckCircle2,
  Loader2,
  PlayCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import type { PbcDocument, ValidationResult } from '../types'
import { Badge } from './ui/Badge'
import { Card, CardBody, CardHeader } from './ui/Card'

interface Props {
  document: PbcDocument
  result?: ValidationResult
  isRunning: boolean
  onRun: () => void
}

export function ValidationPanel({ document: doc, result, isRunning, onRun }: Props) {
  const decisionTone =
    result?.decision === 'AUTO_ACCEPT'
      ? 'green'
      : result?.decision === 'AUTO_REJECT'
        ? 'red'
        : 'neutral'

  return (
    <Card>
      <CardHeader
        title="Auto-Validation Gate"
        description="Deterministic AI rules with explainable decision"
        right={
          <Badge tone="blue">
            <ShieldCheck size={12} strokeWidth={2.5} />
            Engine v1.4
          </Badge>
        }
      />
      <CardBody className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-slate-50/60 p-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Selected request
            </div>
            <div className="font-medium text-slate-900 truncate">
              {doc.id} · {doc.title}
            </div>
            <div className="text-xs text-slate-500">
              POC {doc.pocName} → Auditor {doc.auditorName}
            </div>
          </div>
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className={clsx(
              'inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
              isRunning
                ? 'bg-slate-200 text-slate-500 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
            )}
          >
            {isRunning ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Validating…
              </>
            ) : (
              <>
                <PlayCircle size={14} strokeWidth={2.25} />
                Run Validation
              </>
            )}
          </button>
        </div>

        {!result && !isRunning && (
          <div className="rounded-md border border-dashed border-slate-200 px-4 py-8 text-center">
            <p className="text-sm text-slate-600">
              Click <span className="font-medium">Run Validation</span> to invoke the
              Auto-Validation Gate on this submission.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              The engine will evaluate 5 rules and either auto-accept or auto-reject the
              document with an itemized explanation.
            </p>
          </div>
        )}

        {isRunning && <ValidationSkeleton />}

        {result && !isRunning && (
          <div className="space-y-4">
            <div
              className={clsx(
                'rounded-md p-4 ring-1 ring-inset',
                result.decision === 'AUTO_ACCEPT'
                  ? 'bg-emerald-50 ring-emerald-200'
                  : 'bg-rose-50 ring-rose-200',
              )}
            >
              <div className="flex items-start gap-3">
                {result.decision === 'AUTO_ACCEPT' ? (
                  <CheckCircle2 className="text-emerald-600 mt-0.5" size={22} />
                ) : (
                  <XCircle className="text-rose-600 mt-0.5" size={22} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">
                      {result.decision === 'AUTO_ACCEPT' ? 'Auto-Accepted' : 'Auto-Rejected'}
                    </span>
                    <Badge tone={decisionTone}>
                      Confidence {(result.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{result.explanation}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">Recommended action: </span>
                    {result.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            <ul className="divide-y divide-slate-100 rounded-md border border-slate-200">
              {result.checks.map((c) => (
                <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                  {c.passed ? (
                    <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-rose-600 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{c.detail}</div>
                  </div>
                  <Badge tone={c.passed ? 'green' : 'red'}>
                    {c.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function ValidationSkeleton() {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="h-16 rounded-md bg-slate-100 animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-md bg-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
