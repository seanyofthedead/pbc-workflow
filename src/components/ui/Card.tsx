import clsx from 'clsx'
import type { ReactNode } from 'react'

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={clsx(
        'bg-white border border-slate-200 rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.04)]',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  description,
  right,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  right?: ReactNode
  className?: string
}) {
  return (
    <header
      className={clsx(
        'flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-slate-100',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  )
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={clsx('p-5', className)}>{children}</div>
}
