import clsx from 'clsx'
import { Sparkles, Wand2 } from 'lucide-react'
import type { PbcDocument, RiskLevel } from '../types'
import { Badge } from './ui/Badge'
import { Card, CardBody, CardHeader } from './ui/Card'

const riskTone: Record<RiskLevel, 'green' | 'amber' | 'red'> = {
  Low: 'green',
  Medium: 'amber',
  High: 'red',
}

interface Props {
  documents: PbcDocument[]
  selectedId: string
  onSelect: (id: string) => void
}

export function RequestGenerationCard({ documents, selectedId, onSelect }: Props) {
  const counts = {
    High: documents.filter((d) => d.riskLevel === 'High').length,
    Medium: documents.filter((d) => d.riskLevel === 'Medium').length,
    Low: documents.filter((d) => d.riskLevel === 'Low').length,
  }
  const selected = documents.find((d) => d.id === selectedId) ?? documents[0]

  return (
    <Card>
      <CardHeader
        title="AI-Generated PBC Requests"
        description="Risk-based scoping derived from ERP signals, prior-period exceptions, and PCAOB walkthrough findings"
        right={
          <Badge tone="violet">
            <Wand2 size={12} strokeWidth={2.5} />
            Agent: Request Planner
          </Badge>
        }
      />
      <CardBody className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <SummaryTile label="High Risk" tone="red" value={counts.High} />
          <SummaryTile label="Medium Risk" tone="amber" value={counts.Medium} />
          <SummaryTile label="Low Risk" tone="green" value={counts.Low} />
        </div>
        <div className="rounded-md border border-violet-200 bg-violet-50/60 px-3.5 py-2.5">
          <div className="flex items-start gap-2">
            <Sparkles size={14} className="text-violet-600 mt-0.5 shrink-0" strokeWidth={2.25} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">
                Why {selected.id} was generated
              </div>
              <p className="mt-0.5 text-xs text-slate-700 leading-snug">
                {selected.riskRationale}
              </p>
            </div>
          </div>
        </div>
        <div className="-mx-1 flex flex-wrap gap-1.5">
          {documents.map((d) => {
            const isActive = d.id === selectedId
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelect(d.id)}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'border-blue-300 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                <span className="font-mono">{d.id}</span>
                <Badge tone={riskTone[d.riskLevel]} className="text-[10px] px-1.5 py-0">
                  {d.riskLevel}
                </Badge>
              </button>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string
  tone: 'red' | 'amber' | 'green'
  value: number
}) {
  const ringClass =
    tone === 'red'
      ? 'ring-rose-200 bg-rose-50/70'
      : tone === 'amber'
        ? 'ring-amber-200 bg-amber-50/70'
        : 'ring-emerald-200 bg-emerald-50/70'
  const valueClass =
    tone === 'red'
      ? 'text-rose-700'
      : tone === 'amber'
        ? 'text-amber-700'
        : 'text-emerald-700'
  return (
    <div className={clsx('rounded-md ring-1 ring-inset px-3 py-2', ringClass)}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
        {label}
      </div>
      <div className={clsx('text-xl font-semibold tabular-nums leading-tight', valueClass)}>
        {value}
      </div>
    </div>
  )
}
