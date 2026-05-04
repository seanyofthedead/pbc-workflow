import clsx from 'clsx'
import { AlertTriangle, FileText, PenLine } from 'lucide-react'
import { formatCurrency } from '../lib/validate'
import type { CheckId, PbcDocument, ValidationResult } from '../types'
import { Badge } from './ui/Badge'
import { Card, CardBody, CardHeader } from './ui/Card'

interface Props {
  document: PbcDocument
  result?: ValidationResult
}

export function DocumentViewer({ document: doc, result }: Props) {
  const failedChecks = (id: CheckId) =>
    result?.checks.find((c) => c.id === id && !c.passed)

  const periodFail = failedChecks('period-alignment')
  const reconFail = failedChecks('reconciliation')
  const sigFail = failedChecks('signature')
  const checklistFail = failedChecks('completeness')

  const f = doc.financialData
  const outstandingTotal = f.outstandingChecks.reduce((s, l) => s + l.amount, 0)
  const inTransitTotal = f.depositsInTransit.reduce((s, l) => s + l.amount, 0)
  const reconciledBank = f.bankBalance - outstandingTotal + inTransitTotal

  return (
    <Card>
      <CardHeader
        title="Document Viewer"
        description="Fields with validation issues are highlighted"
        right={
          <Badge tone="neutral">
            <FileText size={12} />
            {doc.documentType}
          </Badge>
        }
      />
      <CardBody className="space-y-5">
        <DocMeta doc={doc} periodFailDetail={periodFail?.detail} />

        <FieldGroup title="Financial Reconciliation">
          <DataRow label="GL Balance (per books)">
            <span
              className={clsx(reconFail && fieldErrorClasses)}
              title={reconFail?.detail}
            >
              {formatCurrency(f.glBalance)}
            </span>
          </DataRow>
          <DataRow label="Bank Statement Balance">
            {formatCurrency(f.bankBalance)}
          </DataRow>
          <DataRow label="Less: Outstanding Checks">
            -{formatCurrency(outstandingTotal)}
          </DataRow>
          <DataRow label="Add: Deposits in Transit">
            {formatCurrency(inTransitTotal)}
          </DataRow>
          <DataRow label="Reconciled Bank Total" emphasis>
            {formatCurrency(reconciledBank)}
          </DataRow>
          <DataRow
            label="Variance (GL − Reconciled)"
            emphasis
          >
            <span
              className={clsx(reconFail && fieldErrorClasses)}
              title={reconFail?.detail}
            >
              {formatCurrency(f.glBalance - reconciledBank)}
            </span>
          </DataRow>
          {reconFail && (
            <InlineError message={reconFail.detail} />
          )}
        </FieldGroup>

        <FieldGroup title="Outstanding Items">
          {f.outstandingChecks.length === 0 && (
            <p className="text-sm text-slate-500 italic">None reported.</p>
          )}
          {f.outstandingChecks.map((line, i) => (
            <DataRow key={`oc-${i}`} label={line.label}>
              {formatCurrency(line.amount)}
            </DataRow>
          ))}
          {f.depositsInTransit.length > 0 &&
            f.depositsInTransit.map((line, i) => (
              <DataRow key={`dt-${i}`} label={line.label}>
                {formatCurrency(line.amount)}
              </DataRow>
            ))}
        </FieldGroup>

        <FieldGroup title="Required Checklist">
          <ul className="space-y-1.5">
            {doc.requiredChecklist.map((item) => (
              <li
                key={item.label}
                className={clsx(
                  'flex items-center justify-between text-sm',
                  !item.present && 'text-rose-700',
                )}
              >
                <span>
                  {item.present ? '✓ ' : '✗ '}
                  {item.label}
                </span>
                <Badge tone={item.present ? 'green' : 'red'}>
                  {item.present ? 'Attached' : 'Missing'}
                </Badge>
              </li>
            ))}
          </ul>
          {checklistFail && <InlineError message={checklistFail.detail} />}
        </FieldGroup>

        <FieldGroup title="Authorization">
          <div
            className={clsx(
              'rounded-md p-3 border',
              sigFail
                ? 'border-rose-300 bg-rose-50/60'
                : 'border-slate-200 bg-slate-50/60',
            )}
          >
            <div className="flex items-start gap-2">
              <PenLine
                size={16}
                className={sigFail ? 'text-rose-600' : 'text-emerald-600'}
              />
              <div className="text-sm">
                {doc.signaturePresent ? (
                  <>
                    <div className="font-medium text-slate-900">{doc.signedBy}</div>
                    <div className="text-xs text-slate-500">
                      Signed {doc.signatureDate}
                    </div>
                  </>
                ) : (
                  <div className="font-medium text-rose-700">
                    No authorized signature on file.
                  </div>
                )}
              </div>
            </div>
          </div>
          {sigFail && <InlineError message={sigFail.detail} />}
        </FieldGroup>
      </CardBody>
    </Card>
  )
}

const fieldErrorClasses =
  'inline-block px-1.5 -mx-1.5 rounded ring-1 ring-rose-300 bg-rose-50 text-rose-800 cursor-help'

function DocMeta({
  doc,
  periodFailDetail,
}: {
  doc: PbcDocument
  periodFailDetail?: string
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-sm">
      <Meta label="Request ID" value={doc.id} />
      <Meta label="Document Type" value={doc.documentType} />
      <Meta label="POC" value={doc.pocName} />
      <Meta label="Auditor" value={doc.auditorName} />
      <Meta label="Uploaded" value={doc.uploadDate} />
      <Meta label="Due" value={doc.dueDate} />
      <Meta
        label="Period Covered"
        value={`${doc.periodCovered.start} → ${doc.periodCovered.end}`}
        error={Boolean(periodFailDetail)}
        title={periodFailDetail}
      />
      <Meta
        label="Required Period"
        value={`${doc.requiredPeriod.start} → ${doc.requiredPeriod.end}`}
      />
    </div>
  )
}

function Meta({
  label,
  value,
  error,
  title,
}: {
  label: string
  value: string
  error?: boolean
  title?: string
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div
        className={clsx(
          'font-medium text-slate-900 mt-0.5',
          error && fieldErrorClasses,
        )}
        title={title}
      >
        {value}
      </div>
    </div>
  )
}

function FieldGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function DataRow({
  label,
  children,
  emphasis,
}: {
  label: string
  children: React.ReactNode
  emphasis?: boolean
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-b-0',
        emphasis && 'font-semibold',
      )}
    >
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900 tabular-nums">{children}</span>
    </div>
  )
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
