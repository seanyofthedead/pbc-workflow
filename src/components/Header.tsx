import { ShieldCheck } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-blue-600 text-white flex items-center justify-center">
            <ShieldCheck size={20} strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight tracking-tight">
              PBC Workflow
            </h1>
            <p className="text-xs text-slate-500 leading-tight">
              Auto-Validation Gate · Q3 2026 Audit Cycle
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connected to SharePoint, Power Apps, Dataverse
          </span>
          <span>Auditor: Priya Raman</span>
        </div>
      </div>
    </header>
  )
}
