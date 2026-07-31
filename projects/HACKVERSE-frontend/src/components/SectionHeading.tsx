import type { PropsWithChildren } from 'react'
export function SectionHeading({ eyebrow, title, children }: PropsWithChildren<{ eyebrow?: string; title: string }>) { return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{children}</div> }
