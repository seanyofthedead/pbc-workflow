import clsx from 'clsx'
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react'
import type { PbcDocument, ValidationResult } from '../types'
import { Badge } from './ui/Badge'
import { Card, CardBody, CardHeader } from './ui/Card'
import { DraftMessageCard } from './DraftMessageCard'
import { ResubmissionLoop } from './ResubmissionLoop'

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
        title="Early Validation Gate"
        description="AI agent evaluates the submission before it reaches the auditor"
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
            data-demo-handle="run-validation"
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

        <div className="rounded-md border border-violet-200 bg-violet-50/50 px-3.5 py-2.5">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-violet-600 mt-0.5 shrink-0" strokeWidth={2.25} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                Why this request was generated
              </div>
              <p className="mt-0.5 text-xs text-slate-700 leading-snug">
                {doc.riskRationale}
              </p>
            </div>
          </div>
        </div>

        {!result && !isRunning && (
          <div className="rounded-md border border-dashed border-slate-200 px-4 py-8 text-center">
            <p className="text-sm text-slate-600">
              Click <span className="font-medium">Run Validation</span> to invoke the
              Early Validation Gate on this submission.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              The agent evaluates 5 rules and either auto-accepts or returns the document to
              the POC with itemized corrections.
            </p>
          </div>
        )}

        {isRunning && <ValidationSkeleton />}

        {result && !isRunning && (
          <div className="space-y-4">
            <div
              className={clsx(
                'rounded-md p-4 ring-1 ring-inset transition-all',
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
                      {result.decision === 'AUTO_ACCEPT'
                        ? 'AI Pre-Validation Completed — Auto-Accepted'
                        : 'Submission Does Not Meet Audit Requirements'}
                    </span>
                    <Badge tone={decisionTone}>
                      Confidence {(result.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    AI Findings Summary
                  </div>
                  <p className="mt-0.5 text-sm text-slate-700 leading-snug">
                    {result.explanation}
                  </p>
                  <p className="mt-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-700">Recommended action: </span>
                    {result.recommendedAction}
                  </p>
                </div>
              </div>
            </div>

            {result.decision === 'AUTO_REJECT' && (
              <FailureBreakdown result={result} />
            )}

            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1.5">
                Rule-by-rule outcome
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

            {result.decision === 'AUTO_REJECT' && (
              <>
                <DraftMessageCard
                  key={`${doc.id}-${result.validatedAt}`}
                  document={doc}
                  result={result}
                />
                <ResubmissionLoop />
              </>
            )}
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

function humanizeFailure(checkId: string, detail: string): {
  why: string
  fix: string
} {
  switch (checkId) {
    case 'signature':
      return {
        why: 'No authorized sign-off was captured. Auditors require an attested approval before reviewing reconciliation results.',
        fix: 'POC must add controller-level e-signature in the reconciliation footer, then resubmit.',
      }
    case 'reconciliation':
      return {
        why: `The numbers do not tie. ${detail} A reconciliation that does not balance cannot be relied on as evidence.`,
        fix: 'Investigate the variance — common causes are missed outstanding items or stale GL postings. Update the supporting schedule and resubmit.',
      }
    case 'period-alignment':
      return {
        why: 'The submitted reporting period does not match the period the auditor requested. Reviewing the wrong period creates rework downstream.',
        fix: 'Pull the reconciliation for the requested period and replace the file in SharePoint.',
      }
    case 'completeness':
      return {
        why: 'The submission package is missing required supporting items. Auditors cannot opine without the full evidence set.',
        fix: 'Attach every item on the request checklist and resubmit as a single package.',
      }
    case 'required-fields':
      return {
        why: 'Submission metadata is incomplete, so the package cannot be unambiguously routed and tracked.',
        fix: 'Fill in the missing metadata fields in the upload form and resubmit.',
      }
    default:
      return {
        why: detail,
        fix: 'Correct the highlighted issue and resubmit through SharePoint.',
      }
  }
}

function FailureBreakdown({ result }: { result: ValidationResult }) {
  const failures = result.checks.filter((c) => !c.passed)
  if (failures.length === 0) return null

  return (
    <div className="rounded-md border border-rose-200 bg-rose-50/40">
      <div className="px-4 py-2.5 border-b border-rose-100 flex items-center gap-2">
        <AlertTriangle size={14} className="text-rose-600" strokeWidth={2.25} />
        <span className="text-[12px] font-semibold uppercase tracking-wide text-rose-800">
          Issues Detected ({failures.length})
        </span>
      </div>
      <ul className="divide-y divide-rose-100">
        {failures.map((f) => {
          const { why, fix } = humanizeFailure(f.id, f.detail)
          return (
            <li key={f.id} className="px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">{f.name}</div>
              <div className="mt-1.5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                    Why this failed
                  </div>
                  <p className="text-xs text-slate-700 leading-snug mt-0.5">{why}</p>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 inline-flex items-center gap-1">
                    <Lightbulb size={11} strokeWidth={2.5} />
                    Recommended fix
                  </div>
                  <p className="text-xs text-slate-700 leading-snug mt-0.5">{fix}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
