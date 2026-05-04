import {
  Bell,
  Cloud,
  Database,
  FileSearch,
  Gavel,
  ScanSearch,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { AuditEventKind, AuditLogEntry } from '../types'
import { Card, CardBody, CardHeader } from './ui/Card'

const kindIcon: Record<
  AuditEventKind,
  ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
> = {
  'upload-detected': Cloud,
  'metadata-retrieved': FileSearch,
  'rules-applied': ScanSearch,
  'decision-made': Gavel,
  'notification-sent': Bell,
  'status-writeback': Database,
}

export function DecisionLog({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <Card className="h-full">
      <CardHeader
        title="AI Decision Log"
        description="Audit trail across SharePoint, Power Apps, Validation Engine, Power Automate, and Dataverse"
      />
      <CardBody>
        {entries.length === 0 ? (
          <div className="text-sm text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-md">
            No validation events yet. Run a validation to populate the audit trail.
          </div>
        ) : (
          <ol className="relative pl-7">
            <span
              aria-hidden
              className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200"
            />
            {entries.map((e) => {
              const Icon = kindIcon[e.kind]
              return (
                <li key={e.id} className="relative pb-4 last:pb-0">
                  <span className="absolute -left-6 top-0.5 h-5 w-5 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                    <Icon size={11} className="text-slate-600" strokeWidth={2.25} />
                  </span>
                  <div className="text-sm text-slate-900 font-medium leading-tight">
                    {e.message}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-600">{e.source}</span>
                    <span className="mx-1.5">·</span>
                    <span>{formatRelative(e.at)}</span>
                    <span className="mx-1.5">·</span>
                    <span className="font-mono">{e.documentId}</span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  )
}

function formatRelative(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
