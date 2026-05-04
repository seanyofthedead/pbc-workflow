export type RiskLevel = 'Low' | 'Medium' | 'High'

export type DocStatus =
  | 'Pending Validation'
  | 'Auto-Accepted'
  | 'Auto-Rejected'
  | 'Awaiting Resubmission'

export type DocumentType =
  | 'Bank Reconciliation'
  | 'Trial Balance'
  | 'AR Aging'
  | 'AP Aging'
  | 'Fixed Asset Register'

export type IssueKind =
  | 'missing-signature'
  | 'amount-mismatch'
  | 'wrong-period'
  | 'incomplete-checklist'

export interface ChecklistItem {
  label: string
  present: boolean
}

export interface FinancialLine {
  label: string
  amount: number
}

export interface FinancialData {
  currency: 'USD'
  glBalance: number
  bankBalance: number
  outstandingChecks: FinancialLine[]
  depositsInTransit: FinancialLine[]
  reconciledTotal: number
  variance: number
}

export interface PbcDocument {
  id: string
  title: string
  documentType: DocumentType
  pocName: string
  pocEmail: string
  auditorName: string
  dueDate: string
  uploadDate: string
  periodCovered: { start: string; end: string }
  requiredPeriod: { start: string; end: string }
  status: DocStatus
  riskLevel: RiskLevel
  financialData: FinancialData
  requiredChecklist: ChecklistItem[]
  signaturePresent: boolean
  signedBy?: string
  signatureDate?: string
  embeddedIssues: IssueKind[]
}

export type CheckId =
  | 'required-fields'
  | 'signature'
  | 'reconciliation'
  | 'period-alignment'
  | 'completeness'

export interface CheckResult {
  id: CheckId
  name: string
  passed: boolean
  detail: string
  fieldHints: string[]
  weight: number
}

export type ValidationDecision = 'AUTO_ACCEPT' | 'AUTO_REJECT'

export interface ValidationResult {
  documentId: string
  checks: CheckResult[]
  decision: ValidationDecision
  confidence: number
  explanation: string
  recommendedAction: string
  validatedAt: string
}

export type AuditEventKind =
  | 'upload-detected'
  | 'metadata-retrieved'
  | 'rules-applied'
  | 'decision-made'
  | 'notification-sent'
  | 'status-writeback'

export interface AuditLogEntry {
  id: string
  documentId: string
  kind: AuditEventKind
  source: 'SharePoint' | 'Power Apps' | 'Validation Engine' | 'Power Automate' | 'Dataverse'
  message: string
  at: string
}
