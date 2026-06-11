# PBC Workflow — Auto-Validation Gate Demo

A self-contained, front-end-only MVP demonstrating an AI-enabled **Prepared By Client (PBC)** audit workflow. The demo focuses on the *Auto-Validation Gate*: when a document is "uploaded," a deterministic rule engine simulates an AI validator, then either auto-accepts the submission and notifies the auditor, or auto-rejects it with itemized correction instructions for the Point of Contact (POC).

Everything runs in the browser. There is no backend, no real document storage, and no external API calls. SharePoint, Power Apps, Power Automate, and Dataverse are all simulated in-memory.

## What this demonstrates

- **Auto-Validation Gate** — five rule checks (required fields, signature, financial reconciliation, period alignment, checklist completeness) run against a selected submission and produce an explainable Auto-Accept / Auto-Reject decision with a confidence score.
- **Realistic synthetic data** — five preloaded bank-reconciliation requests covering one valid case and four distinct invalid scenarios (missing signature, amount mismatch, wrong period, incomplete submission).
- **End-to-end audit trail** — every validation generates a six-step timeline mirroring SharePoint → Power Apps → Validation Engine → Power Automate → Dataverse interactions.
- **Executive dashboard** — KPI tiles update live as validations complete; ROI panel and a before-vs-after workflow comparison make the business case at a glance.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:5173/>. The dashboard loads immediately with all five preloaded submissions; no setup, no fixtures to seed.

Other useful commands:

```bash
npm run build      # type-check + production build
npm run build:demo # bundle a single self-contained demo HTML file
npm run lint       # eslint
npm run preview    # serve the production build
```

## Single-file demo (no server, no install)

For sharing or presenting without a dev server, `npm run build:demo` bundles the
real app into one self-contained HTML file at the repo root:

```bash
npm run build:demo
# → writes pbc-workflow-demo.html (all JS + CSS inlined)
```

Open `pbc-workflow-demo.html` directly in any browser (double-click, or email it
to someone) — it runs fully offline with no backend. This build uses a dedicated
entry (`demo.html` → `src/demo-main.tsx`) that renders `<App />` directly,
skipping the Amplify/Cognito `AuthGate` used by the hosted app. It's the same
real app and components; only the sign-in gate is removed (all integrations are
already simulated in-memory, so there's nothing to authenticate against). The
single-file build is driven by `vite.demo.config.ts` via `vite-plugin-singlefile`.

## 5-minute demo script

1. **Open the dashboard.** Point out the KPI tile row (Total / Pending / Accepted / Rejected, plus Touchless %, Cycle Time Reduction, Hours Saved). Note that the queue starts with five Pending submissions.
2. **Select an invalid submission** — `PBC-1043 Bank Reconciliation — Payroll Account` (missing signature). The Document Viewer on the right renders the reconciliation; the missing checklist item and authorization block are already visible.
3. **Click "Run Validation."** A loading skeleton appears while the AI Decision Log fills in: Upload detected → Metadata retrieved → Rules applied → Decision made → Notification sent → Status written back. Each entry is tagged with its source system.
4. **Read the rejection.** The validation card shows Auto-Reject with a 91% confidence score, an explanation ("2 of 5 rules failed…"), and a recommended action ("Email POC with itemized correction instructions"). The Document Viewer highlights the failing fields in red. The queue badge flips to Awaiting Resubmission.
5. **Select `PBC-1042` (the valid Operating Account reconciliation) and click "Run Validation" again.** This time you get Auto-Accept at 97% confidence, all five rules pass, and the recommended action is to notify the auditor. The queue badge becomes Auto-Accepted and the KPI tiles update accordingly.

For a longer demo, walk through the remaining invalid scenarios — `PBC-1044` (variance mismatch), `PBC-1045` (Q2 period submitted for a Q3 request), and `PBC-1046` (multiple checklist gaps) — to show how each failure type produces a different itemized rejection.

## How it works

| Concern | Where it lives |
|---|---|
| Document type definitions | `src/types.ts` |
| Synthetic dataset (5 scenarios) | `src/data/documents.ts` |
| Validation engine (pure function) | `src/lib/validate.ts` |
| Composition + simulated async | `src/App.tsx` |
| UI components | `src/components/` |
| Tailwind v4 entry | `src/index.css` (single `@import "tailwindcss";`) |

The validation engine in `src/lib/validate.ts` is a pure, deterministic function — `validate(doc) → { checks, decision, confidence, explanation, recommendedAction }`. Each rule has a weight; confidence is computed from the weighted pass ratio (no `Math.random`).

The "AI thinking" timing in `App.tsx` is artificial `setTimeout` delays (~500ms between audit events) so the timeline animates naturally during the demo.

## Stack

- React 19 + TypeScript + Vite 8
- Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js`, no `@tailwind` directives)
- `lucide-react` for icons, `clsx` for conditional classes
- No router, no global state library, no backend, no auth

## Known limitations

- The validation engine is deterministic rules, not a real LLM. Confidence scores are computed, not learned.
- All "integrations" (SharePoint, Power Apps, Power Automate, Dataverse) are simulated by `setTimeout` and in-memory state mutations.
- The dataset only covers Bank Reconciliation today. Other document types (Trial Balance, AR/AP Aging, Fixed Asset Register) are typed but not preloaded.
- State is held in React; refreshing the page resets all validations and audit log entries.
- No accessibility audit beyond Tailwind defaults; ARIA coverage on the timeline and result card should be reviewed before client demos with assistive-tech users.
- No tests. A future iteration should add Vitest coverage of `src/lib/validate.ts` against each scenario in the dataset.

## Next steps for production

1. **Real ingestion path.** Replace `initialDocuments` with a SharePoint webhook + Power Automate trigger, and the simulated audit log with a real append-only log written to Dataverse.
2. **Replace the rule engine with a hybrid LLM gate.** Use the existing rules as a deterministic floor; layer an LLM call (Claude or Azure OpenAI) for fuzzier reconciliations, narrative consistency, and document-quality checks. Persist the model version + prompt with each decision for auditability.
3. **Persistence.** Write decisions, confidence, and audit-log entries to Dataverse with immutability guarantees (append-only, signed). Maintain a separate Cosmos DB or Azure Storage table for the simulated SharePoint metadata.
4. **Authentication & authorization.** Microsoft Entra ID SSO with role gating: Coordinator / POC / Auditor see different surfaces and actions.
5. **Notification system.** Wire Power Automate to send the actual Outlook / Teams notifications described in the recommended-action text.
6. **Test coverage.** Vitest for the validation engine, Playwright for the click-through demo flow used in this README.
7. **Observability.** Application Insights traces correlated by `documentId`, plus a dashboard for touchless rate, decision distribution, and rule failure histograms.
