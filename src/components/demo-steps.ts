export type DemoTargetId =
  | 'requests'
  | 'document'
  | 'validation'
  | 'decision'
  | 'log'

export interface DemoStep {
  target: DemoTargetId
  title: string
  body: string
  cta?: string
}

export const demoSteps: DemoStep[] = [
  {
    target: 'requests',
    title: '1. AI generates risk-based requests',
    body: 'The Request Planner agent scopes only what the audit actually needs — five PBCs, ranked by risk. PBC-1043 is auto-selected.',
    cta: 'Move to upload',
  },
  {
    target: 'document',
    title: '2. POC uploads to SharePoint',
    body: 'A new payroll reconciliation lands in the connected SharePoint folder. The orchestrator detects it instantly — no human routing.',
    cta: 'Run validation',
  },
  {
    target: 'validation',
    title: '3. Early Validation Gate runs',
    body: 'Five rules score the package in under two seconds. Watch the lifecycle bar light up the validation node.',
    cta: 'Show decision',
  },
  {
    target: 'decision',
    title: '4. Auto-Reject with itemized findings',
    body: 'Missing signature is caught before the auditor sees it. The agent drafts the POC message and queues a closed-loop resubmission.',
    cta: 'Show audit trail',
  },
  {
    target: 'log',
    title: '5. Every decision is logged and routed',
    body: 'A timestamped audit trail captures the full chain — SharePoint → Validation Engine → Power Automate → Dataverse. Nothing is invisible to the auditor.',
    cta: 'Restart demo',
  },
]
