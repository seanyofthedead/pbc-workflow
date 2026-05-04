import { useMemo, useState } from 'react'
import { DecisionLog } from './components/DecisionLog'
import { DocumentViewer } from './components/DocumentViewer'
import { Header } from './components/Header'
import { KpiTiles } from './components/KpiTiles'
import { RequestQueue } from './components/RequestQueue'
import { RoiPanel } from './components/RoiPanel'
import { ValidationPanel } from './components/ValidationPanel'
import { WorkflowComparison } from './components/WorkflowComparison'
import { initialDocuments } from './data/documents'
import { validate } from './lib/validate'
import type { AuditLogEntry, PbcDocument, ValidationResult } from './types'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

function buildLog(
  doc: PbcDocument,
  result: ValidationResult,
): Omit<AuditLogEntry, 'id'>[] {
  const base = (overrides: Omit<AuditLogEntry, 'id' | 'documentId' | 'at'>): Omit<
    AuditLogEntry,
    'id'
  > => ({
    ...overrides,
    documentId: doc.id,
    at: new Date().toISOString(),
  })

  const failed = result.checks.filter((c) => !c.passed).length
  const passed = result.checks.length - failed

  return [
    base({
      kind: 'upload-detected',
      source: 'SharePoint',
      message: `Upload event detected for ${doc.id} (${doc.documentType}).`,
    }),
    base({
      kind: 'metadata-retrieved',
      source: 'Power Apps',
      message: `Metadata retrieved: POC ${doc.pocName}, period ${doc.periodCovered.start} → ${doc.periodCovered.end}.`,
    }),
    base({
      kind: 'rules-applied',
      source: 'Validation Engine',
      message: `Applied 5 validation rules: ${passed} passed, ${failed} failed.`,
    }),
    base({
      kind: 'decision-made',
      source: 'Validation Engine',
      message:
        result.decision === 'AUTO_ACCEPT'
          ? `Decision: AUTO-ACCEPT at ${(result.confidence * 100).toFixed(0)}% confidence.`
          : `Decision: AUTO-REJECT at ${(result.confidence * 100).toFixed(0)}% confidence.`,
    }),
    base({
      kind: 'notification-sent',
      source: 'Power Automate',
      message:
        result.decision === 'AUTO_ACCEPT'
          ? `Notified auditor ${doc.auditorName} that ${doc.id} is ready for review.`
          : `Sent itemized correction email to ${doc.pocEmail}.`,
    }),
    base({
      kind: 'status-writeback',
      source: 'Dataverse',
      message:
        result.decision === 'AUTO_ACCEPT'
          ? `Status written back: Auto-Accepted.`
          : `Status written back: Awaiting Resubmission.`,
    }),
  ]
}

function App() {
  const [documents, setDocuments] = useState<PbcDocument[]>(initialDocuments)
  const [selectedId, setSelectedId] = useState<string>(initialDocuments[1].id)
  const [results, setResults] = useState<Record<string, ValidationResult>>({})
  const [runningId, setRunningId] = useState<string | null>(null)
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([])

  const selected = useMemo(
    () => documents.find((d) => d.id === selectedId) ?? documents[0],
    [documents, selectedId],
  )

  const appendLog = (entry: Omit<AuditLogEntry, 'id'>) => {
    setAuditLog((prev) => [
      { ...entry, id: `evt-${prev.length + 1}-${Date.now()}` },
      ...prev,
    ])
  }

  const handleRun = async () => {
    if (runningId) return
    const doc = selected
    setRunningId(doc.id)

    const result = validate(doc)
    const events = buildLog(doc, result)

    // Stage SharePoint + Power Apps signals first ("AI is thinking").
    await wait(550)
    appendLog(events[0])
    await wait(450)
    appendLog(events[1])
    await wait(500)
    appendLog(events[2])
    await wait(550)

    // Decision lands.
    appendLog(events[3])

    // Result is shown to user now.
    setResults((prev) => ({ ...prev, [doc.id]: result }))
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === doc.id
          ? {
              ...d,
              status:
                result.decision === 'AUTO_ACCEPT'
                  ? 'Auto-Accepted'
                  : 'Awaiting Resubmission',
            }
          : d,
      ),
    )

    await wait(450)
    appendLog(events[4])
    await wait(400)
    appendLog(events[5])

    setRunningId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        <KpiTiles documents={documents} />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5 space-y-6">
            <RequestQueue
              documents={documents}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <DecisionLog entries={auditLog} />
          </div>
          <div className="xl:col-span-7 space-y-6">
            <ValidationPanel
              document={selected}
              result={results[selected.id]}
              isRunning={runningId === selected.id}
              onRun={handleRun}
            />
            <DocumentViewer
              document={selected}
              result={results[selected.id]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <WorkflowComparison />
          <RoiPanel />
        </div>

        <footer className="pt-2 pb-6 text-center text-xs text-slate-500">
          PBC Workflow demo · Front-end only · All integrations simulated in-memory
        </footer>
      </main>
    </div>
  )
}

export default App
