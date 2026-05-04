import type {
  CheckResult,
  PbcDocument,
  ValidationDecision,
  ValidationResult,
} from '../types'

const RECONCILIATION_TOLERANCE = 0.01

function checkRequiredFields(doc: PbcDocument): CheckResult {
  const required: Array<[string, unknown]> = [
    ['title', doc.title],
    ['POC name', doc.pocName],
    ['auditor', doc.auditorName],
    ['due date', doc.dueDate],
    ['upload date', doc.uploadDate],
    ['period covered (start)', doc.periodCovered?.start],
    ['period covered (end)', doc.periodCovered?.end],
    ['GL balance', doc.financialData?.glBalance],
    ['bank balance', doc.financialData?.bankBalance],
  ]
  const missing = required.filter(([, v]) => v === undefined || v === null || v === '')
  const passed = missing.length === 0
  return {
    id: 'required-fields',
    name: 'Required fields completeness',
    passed,
    detail: passed
      ? 'All required submission metadata is present.'
      : `Missing fields: ${missing.map(([k]) => k).join(', ')}.`,
    fieldHints: missing.map(([k]) => k),
    weight: 1,
  }
}

function checkSignature(doc: PbcDocument): CheckResult {
  const passed = doc.signaturePresent === true && Boolean(doc.signedBy)
  return {
    id: 'signature',
    name: 'Authorized signature present',
    passed,
    detail: passed
      ? `Signed by ${doc.signedBy} on ${doc.signatureDate}.`
      : 'No authorized signature found on the reconciliation.',
    fieldHints: passed ? [] : ['signature'],
    weight: 1,
  }
}

function checkReconciliation(doc: PbcDocument): CheckResult {
  const f = doc.financialData
  const outstanding = f.outstandingChecks.reduce((s, l) => s + l.amount, 0)
  const inTransit = f.depositsInTransit.reduce((s, l) => s + l.amount, 0)
  const expected = f.bankBalance - outstanding + inTransit
  const computedVariance = +(f.glBalance - expected).toFixed(2)
  const passed = Math.abs(computedVariance) <= RECONCILIATION_TOLERANCE
  return {
    id: 'reconciliation',
    name: 'Financial reconciliation balances',
    passed,
    detail: passed
      ? 'GL balance reconciles to bank statement within tolerance.'
      : `Unexplained variance of ${formatCurrency(
          computedVariance,
        )} between GL (${formatCurrency(f.glBalance)}) and reconciled bank total (${formatCurrency(expected)}).`,
    fieldHints: passed ? [] : ['glBalance', 'bankBalance', 'reconciledTotal'],
    weight: 2,
  }
}

function checkPeriodAlignment(doc: PbcDocument): CheckResult {
  const passed =
    doc.periodCovered.start === doc.requiredPeriod.start &&
    doc.periodCovered.end === doc.requiredPeriod.end
  return {
    id: 'period-alignment',
    name: 'Reporting period matches request',
    passed,
    detail: passed
      ? `Period ${doc.periodCovered.start} – ${doc.periodCovered.end} matches requested period.`
      : `Submitted period ${doc.periodCovered.start} – ${doc.periodCovered.end} does not match required ${doc.requiredPeriod.start} – ${doc.requiredPeriod.end}.`,
    fieldHints: passed ? [] : ['periodCovered'],
    weight: 1.5,
  }
}

function checkCompleteness(doc: PbcDocument): CheckResult {
  const missing = doc.requiredChecklist.filter((c) => !c.present)
  const passed = missing.length === 0
  return {
    id: 'completeness',
    name: 'Submission checklist complete',
    passed,
    detail: passed
      ? 'All required supporting items are attached.'
      : `Missing required items: ${missing.map((c) => c.label).join('; ')}.`,
    fieldHints: passed ? [] : missing.map((c) => c.label),
    weight: 1.5,
  }
}

export function validate(doc: PbcDocument): ValidationResult {
  const checks: CheckResult[] = [
    checkRequiredFields(doc),
    checkSignature(doc),
    checkReconciliation(doc),
    checkPeriodAlignment(doc),
    checkCompleteness(doc),
  ]

  const totalWeight = checks.reduce((s, c) => s + c.weight, 0)
  const passedWeight = checks.reduce((s, c) => (c.passed ? s + c.weight : s), 0)
  const passRatio = passedWeight / totalWeight

  const decision: ValidationDecision = checks.every((c) => c.passed)
    ? 'AUTO_ACCEPT'
    : 'AUTO_REJECT'

  // Confidence is deterministic: high baseline, scaled by pass ratio,
  // dampened slightly when many checks fail.
  const failedCount = checks.filter((c) => !c.passed).length
  const confidence =
    decision === 'AUTO_ACCEPT'
      ? 0.97
      : Math.max(0.78, 0.95 - failedCount * 0.04 - (1 - passRatio) * 0.05)

  const failures = checks.filter((c) => !c.passed)
  const explanation =
    decision === 'AUTO_ACCEPT'
      ? `All ${checks.length} validation rules passed. Reconciliation balances, signature is on file, and period matches request. Document is ready for auditor review.`
      : `${failures.length} of ${checks.length} validation rules failed. ${failures
          .map((f) => f.name)
          .join('; ')}. Submission cannot proceed without correction.`

  const recommendedAction =
    decision === 'AUTO_ACCEPT'
      ? `Notify auditor ${doc.auditorName}; mark request ${doc.id} as Auto-Accepted in Dataverse.`
      : `Email ${doc.pocName} (${doc.pocEmail}) with itemized correction instructions; set status to Awaiting Resubmission.`

  return {
    documentId: doc.id,
    checks,
    decision,
    confidence: +confidence.toFixed(2),
    explanation,
    recommendedAction,
    validatedAt: new Date().toISOString(),
  }
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n)
}
