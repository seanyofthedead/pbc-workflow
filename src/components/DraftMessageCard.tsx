import clsx from 'clsx'
import { Check, Mail, Send, Sparkles } from 'lucide-react'
import { useState } from 'react'
import type { PbcDocument, ValidationResult } from '../types'
import { Badge } from './ui/Badge'

function buildDraft(doc: PbcDocument, result: ValidationResult): string {
  const failures = result.checks.filter((c) => !c.passed)
  const bullets = failures
    .map((f, i) => `${i + 1}. ${f.name} — ${f.detail}`)
    .join('\n')

  const firstName = doc.pocName.split(' ')[0]
  return `Hi ${firstName},

Thanks for submitting ${doc.id} (${doc.title}). The Early Validation Gate ran on arrival and the package can't move to auditor review yet — the items below need to be corrected and resubmitted to the same SharePoint location:

${bullets}

Once the corrections are in place, the validation re-runs automatically and ${doc.auditorName} will be notified the moment it clears.

Let me know if any of these items need a working session.

Thanks,
PBC Orchestrator (on behalf of ${doc.auditorName})`
}

interface Props {
  document: PbcDocument
  result: ValidationResult
}

export function DraftMessageCard({ document: doc, result }: Props) {
  const [draft, setDraft] = useState(() => buildDraft(doc, result))
  const [sent, setSent] = useState(false)

  return (
    <div className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200">
            <Mail size={14} strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-slate-900 leading-tight">
              Draft Message to POC
            </div>
            <div className="text-[11px] text-slate-500 leading-tight truncate">
              To: {doc.pocEmail} · From: PBC Orchestrator
            </div>
          </div>
        </div>
        <Badge tone="violet">
          <Sparkles size={11} strokeWidth={2.5} />
          AI-drafted · editable
        </Badge>
      </div>
      <div className="p-3">
        <textarea
          aria-label="Draft message to POC"
          className="w-full min-h-[180px] resize-y rounded-md border border-slate-200 bg-slate-50/40 p-3 text-[13px] leading-snug text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (sent) setSent(false)
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            {sent
              ? 'Simulated send — message queued for Power Automate dispatch.'
              : 'Edits are local only — clicking Send simulates dispatch.'}
          </span>
          <button
            type="button"
            onClick={() => setSent(true)}
            disabled={sent}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              sent
                ? 'bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200 cursor-default'
                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm',
            )}
          >
            {sent ? (
              <>
                <Check size={13} strokeWidth={2.5} />
                Sent to POC
              </>
            ) : (
              <>
                <Send size={13} strokeWidth={2.25} />
                Send to POC
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
