import clsx from 'clsx'
import { CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react'
import type { DocStatus, PbcDocument, RiskLevel } from '../types'
import { Badge } from './ui/Badge'
import { Card, CardHeader } from './ui/Card'

const riskTone: Record<RiskLevel, 'green' | 'amber' | 'red'> = {
  Low: 'green',
  Medium: 'amber',
  High: 'red',
}

const statusMeta: Record<
  DocStatus,
  { tone: 'neutral' | 'green' | 'red' | 'amber'; icon: typeof CheckCircle2 }
> = {
  'Pending Validation': { tone: 'neutral', icon: Clock },
  'Auto-Accepted': { tone: 'green', icon: CheckCircle2 },
  'Auto-Rejected': { tone: 'red', icon: XCircle },
  'Awaiting Resubmission': { tone: 'amber', icon: RotateCcw },
}

export function RequestQueue({
  documents,
  selectedId,
  onSelect,
}: {
  documents: PbcDocument[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="PBC Request Queue"
        description="Q3 2026 · 5 requests"
        right={
          <span className="text-[11px] text-slate-500">
            Click a request to inspect
          </span>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr className="text-left">
              <th className="font-medium px-5 py-2.5 text-xs uppercase tracking-wide">
                Request
              </th>
              <th className="font-medium px-3 py-2.5 text-xs uppercase tracking-wide">
                POC
              </th>
              <th className="font-medium px-3 py-2.5 text-xs uppercase tracking-wide">
                Due
              </th>
              <th className="font-medium px-3 py-2.5 text-xs uppercase tracking-wide">
                Risk
              </th>
              <th className="font-medium px-5 py-2.5 text-xs uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((d) => {
              const isActive = d.id === selectedId
              const StatusIcon = statusMeta[d.status].icon
              return (
                <tr
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  className={clsx(
                    'cursor-pointer transition-colors',
                    isActive
                      ? 'bg-blue-50/60'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <td className="px-5 py-3 align-top">
                    <div className="flex items-start gap-3">
                      {isActive && (
                        <span
                          aria-hidden
                          className="h-8 w-1 rounded bg-blue-600 -ml-2"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{d.id}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[280px]">
                          {d.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-slate-700">{d.pocName}</td>
                  <td className="px-3 py-3 align-top text-slate-700 whitespace-nowrap">
                    {d.dueDate}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <Badge tone={riskTone[d.riskLevel]}>{d.riskLevel}</Badge>
                  </td>
                  <td className="px-5 py-3 align-top">
                    <Badge tone={statusMeta[d.status].tone}>
                      <StatusIcon size={12} strokeWidth={2.5} />
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
