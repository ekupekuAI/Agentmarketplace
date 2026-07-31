import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <section className="empty-state" aria-live="polite"><span aria-hidden="true">⌕</span><h3>{title}</h3><p>{description}</p>{action}</section>
}
