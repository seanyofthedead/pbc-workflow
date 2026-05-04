import { ArrowRight, Sparkles, UserCog } from 'lucide-react'
import { Card, CardBody, CardHeader } from './ui/Card'

const manualSteps = [
  'POC uploads to SharePoint',
  'Coordinator manually triages submission',
  'Coordinator opens, eyeballs reconciliation',
  'Emails POC if anything is off',
  'Waits for resubmission (avg 2.5 days)',
  'Re-checks, then routes to auditor',
]

const aiSteps = [
  'POC uploads to SharePoint',
  'Power Automate fires Validation Engine',
  'AI gate scores 5 rules in <2 seconds',
  'Auto-Accept → status updated, auditor notified',
  'Auto-Reject → POC receives itemized fixes',
  'Coordinator reviews only edge cases',
]

export function WorkflowComparison() {
  return (
    <Card>
      <CardHeader
        title="Before vs. After"
        description="Manual coordination workflow vs. AI-gated workflow"
      />
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Column
            tone="manual"
            label="Manual Process"
            icon={<UserCog size={14} />}
            steps={manualSteps}
            footer="Cycle time: 4–7 days · Touchless rate: 0%"
          />
          <Column
            tone="ai"
            label="AI-Enabled Process"
            icon={<Sparkles size={14} />}
            steps={aiSteps}
            footer="Cycle time: <1 day · Touchless rate: 73%"
          />
        </div>
      </CardBody>
    </Card>
  )
}

function Column({
  tone,
  label,
  icon,
  steps,
  footer,
}: {
  tone: 'manual' | 'ai'
  label: string
  icon: React.ReactNode
  steps: string[]
  footer: string
}) {
  const headerClass =
    tone === 'manual'
      ? 'bg-slate-100 text-slate-700 border-slate-200'
      : 'bg-blue-50 text-blue-800 border-blue-200'
  const accentDot =
    tone === 'manual' ? 'bg-slate-400' : 'bg-blue-500'

  return (
    <div className="rounded-md border border-slate-200 overflow-hidden">
      <div
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide border-b ${headerClass}`}
      >
        {icon}
        {label}
      </div>
      <ol className="p-4 space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
            <span
              className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${accentDot}`}
            />
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60 text-xs text-slate-600 flex items-center gap-1.5">
        <ArrowRight size={12} />
        {footer}
      </div>
    </div>
  )
}
