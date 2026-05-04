import { useEffect, useMemo, useState } from 'react'
import { DecisionLog } from './components/DecisionLog'
import {
  DemoModeControls,
  DemoPauseHint,
  DemoSpotlight,
} from './components/DemoMode'
import { demoSteps } from './components/demo-steps'
import { DocumentViewer } from './components/DocumentViewer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { KpiTiles } from './components/KpiTiles'
import { LifecyclePipeline } from './components/LifecyclePipeline'
import { RequestGenerationCard } from './components/RequestGenerationCard'
import { RequestQueue } from './components/RequestQueue'
import { RoiPanel } from './components/RoiPanel'
import { ValidationPanel } from './components/ValidationPanel'
import { WorkflowComparison } from './components/WorkflowComparison'
import { initialDocuments } from './data/documents'
import { validate } from './lib/validate'
import type { AuditLogEntry, PbcDocument, ValidationResult } from './types'

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const DEMO_TARGET_DOC_ID = 'PBC-1043'

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

  const [demoActive, setDemoActive] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

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

  const handleRun = async (overrideId?: string) => {
    if (runningId) return
    const doc = overrideId
      ? documents.find((d) => d.id === overrideId) ?? selected
      : selected
    setRunningId(doc.id)

    const result = validate(doc)
    const events = buildLog(doc, result)

    await wait(550)
    appendLog(events[0])
    await wait(450)
    appendLog(events[1])
    await wait(500)
    appendLog(events[2])
    await wait(550)

    appendLog(events[3])

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

  const startDemo = () => {
    setSelectedId(DEMO_TARGET_DOC_ID)
    setDemoStep(0)
    setDemoActive(true)
  }

  const exitDemo = () => {
    setDemoActive(false)
  }

  const restartDemo = () => {
    setResults({})
    setAuditLog([])
    setDocuments(initialDocuments)
    setSelectedId(DEMO_TARGET_DOC_ID)
    setDemoStep(0)
    setDemoActive(true)
  }

  const advanceDemo = async () => {
    const next = demoStep + 1
    if (next >= demoSteps.length) return

    if (demoSteps[demoStep].target === 'document' && !results[DEMO_TARGET_DOC_ID]) {
      setDemoStep(next)
      void handleRun(DEMO_TARGET_DOC_ID)
      return
    }

    setDemoStep(next)
  }

  const stepBack = () => {
    setDemoStep((s) => Math.max(0, s - 1))
  }

  useEffect(() => {
    if (!demoActive) return
    const target = demoSteps[demoStep].target
    const el = document.querySelector<HTMLElement>(`[data-demo-target="${target}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [demoActive, demoStep])

  const activeTarget = demoActive ? demoSteps[demoStep].target : null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        <Hero />

        <KpiTiles documents={documents} />

        <LifecyclePipeline
          document={selected}
          result={results[selected.id]}
          isRunning={runningId === selected.id}
        />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5 space-y-6">
            <DemoSpotlight targetId="requests" activeTargetId={activeTarget}>
              <RequestGenerationCard
                documents={documents}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </DemoSpotlight>
            <RequestQueue
              documents={documents}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <DemoSpotlight targetId="log" activeTargetId={activeTarget}>
              <DecisionLog entries={auditLog} />
            </DemoSpotlight>
          </div>
          <div className="xl:col-span-7 space-y-6">
            <DemoSpotlight
              targetId="validation"
              matches={['validation', 'decision']}
              activeTargetId={activeTarget}
            >
              <ValidationPanel
                document={selected}
                result={results[selected.id]}
                isRunning={runningId === selected.id}
                onRun={() => handleRun()}
              />
            </DemoSpotlight>
            <DemoSpotlight targetId="document" activeTargetId={activeTarget}>
              <DocumentViewer
                document={selected}
                result={results[selected.id]}
              />
            </DemoSpotlight>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <WorkflowComparison />
          <RoiPanel />
        </div>

        <footer className="pt-2 pb-6 text-center text-xs text-slate-500">
          PBC Workflow demo
        </footer>
      </main>

      <DemoPauseHint active={demoActive} onPause={exitDemo} />
      <DemoModeControls
        active={demoActive}
        step={demoStep}
        onStart={startDemo}
        onExit={exitDemo}
        onNext={advanceDemo}
        onPrev={stepBack}
        onRestart={restartDemo}
      />
    </div>
  )
}

export default App
